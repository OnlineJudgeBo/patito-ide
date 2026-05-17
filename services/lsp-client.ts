import type * as Monaco from 'monaco-editor';
import type { LanguageDefinition } from '@/types/ide';
import { getLanguageServerConfig } from '@/lib/lsp-config';

type MonacoApi = typeof Monaco;

type LspStatus = 'disabled' | 'connecting' | 'connected' | 'error';

type LspPosition = { line: number; character: number };
type LspRange = { start: LspPosition; end: LspPosition };
type LspDiagnostic = { range: LspRange; severity?: number; message: string; source?: string };
type LspCompletionItem = { label: string; detail?: string; documentation?: string | { value?: string }; insertText?: string; kind?: number };
type JsonRpcMessage = { id?: number; method?: string; params?: unknown; result?: unknown; error?: { message?: string } };

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

const clients = new Map<string, BrowserLspClient>();
const registeredCompletionProviders = new Set<string>();

function modelUri(language: LanguageDefinition) {
  return `file:///workspace/main.${language.extension}`;
}

function toLspPosition(position: Monaco.Position): LspPosition {
  return { line: position.lineNumber - 1, character: position.column - 1 };
}

function toMonacoSeverity(monaco: MonacoApi, severity?: number) {
  if (severity === 1) return monaco.MarkerSeverity.Error;
  if (severity === 2) return monaco.MarkerSeverity.Warning;
  if (severity === 3) return monaco.MarkerSeverity.Info;
  return monaco.MarkerSeverity.Hint;
}

function completionDocumentation(documentation: LspCompletionItem['documentation']) {
  if (!documentation) return undefined;
  if (typeof documentation === 'string') return documentation;
  return documentation.value;
}

export class BrowserLspClient {
  private socket?: WebSocket;
  private requestId = 0;
  private pending = new Map<number, PendingRequest>();
  private openedUri?: string;
  private version = 0;

  constructor(
    private readonly monaco: MonacoApi,
    private readonly language: LanguageDefinition,
    private readonly statusChanged: (status: LspStatus, detail: string) => void,
  ) {}

  connect() {
    const config = getLanguageServerConfig(this.language.id);
    if (!config.websocketUrl) {
      this.statusChanged('disabled', `${config.name} not configured. Set its NEXT_PUBLIC_LSP_*_WS endpoint.`);
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) return;

    this.statusChanged('connecting', `Connecting to ${config.name}…`);
    this.socket = new WebSocket(config.websocketUrl);
    this.socket.addEventListener('open', async () => {
      try {
        await this.request('initialize', {
          processId: null,
          rootUri: 'file:///workspace',
          capabilities: {
            textDocument: {
              completion: { completionItem: { snippetSupport: true, documentationFormat: ['markdown', 'plaintext'] } },
              publishDiagnostics: { relatedInformation: true },
            },
          },
          workspaceFolders: null,
        });
        this.notify('initialized', {});
        this.statusChanged('connected', `${config.name} connected.`);
      } catch (error) {
        this.statusChanged('error', error instanceof Error ? error.message : `${config.name} initialization failed.`);
      }
    });
    this.socket.addEventListener('message', (event) => this.handleMessage(event.data));
    this.socket.addEventListener('error', () => this.statusChanged('error', `${config.name} WebSocket error.`));
    this.socket.addEventListener('close', () => this.statusChanged('disabled', `${config.name} disconnected.`));
  }

  dispose() {
    this.socket?.close();
    this.pending.forEach(({ reject }) => reject(new Error('LSP client disposed.')));
    this.pending.clear();
  }

  didOpen(model: Monaco.editor.ITextModel) {
    if (!this.isReady()) return;
    const uri = model.uri.toString();
    this.openedUri = uri;
    this.version = 1;
    this.notify('textDocument/didOpen', {
      textDocument: {
        uri,
        languageId: this.language.monacoLanguage,
        version: this.version,
        text: model.getValue(),
      },
    });
  }

  didChange(model: Monaco.editor.ITextModel) {
    if (!this.isReady() || !this.openedUri) return;
    this.version += 1;
    this.notify('textDocument/didChange', {
      textDocument: { uri: this.openedUri, version: this.version },
      contentChanges: [{ text: model.getValue() }],
    });
  }

  async completions(model: Monaco.editor.ITextModel, position: Monaco.Position) {
    if (!this.isReady()) return [];
    const uri = this.openedUri ?? modelUri(this.language);
    const result = await this.request('textDocument/completion', {
      textDocument: { uri },
      position: toLspPosition(position),
    });
    const items = Array.isArray(result) ? result : (result as { items?: LspCompletionItem[] })?.items ?? [];
    const word = model.getWordUntilPosition(position);
    const range = new this.monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);

    return items.map((item: LspCompletionItem) => ({
      label: item.label,
      kind: this.monaco.languages.CompletionItemKind.Text,
      detail: item.detail,
      documentation: completionDocumentation(item.documentation),
      insertText: item.insertText ?? item.label,
      range,
    }));
  }

  private isReady() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private request(method: string, params: unknown) {
    const id = ++this.requestId;
    this.send({ jsonrpc: '2.0', id, method, params });
    return new Promise<unknown>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      window.setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`LSP request timed out: ${method}`));
      }, 8000);
    });
  }

  private notify(method: string, params: unknown) {
    this.send({ jsonrpc: '2.0', method, params });
  }

  private send(payload: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(payload));
  }

  private handleMessage(raw: string) {
    const message = JSON.parse(raw) as JsonRpcMessage;
    if (typeof message.id === 'number') {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message ?? 'LSP request failed.'));
      else pending.resolve(message.result);
      return;
    }

    if (message.method === 'textDocument/publishDiagnostics') {
      const params = message.params as { diagnostics?: LspDiagnostic[] };
      const markers = (params.diagnostics ?? []).map((diagnostic) => ({
        severity: toMonacoSeverity(this.monaco, diagnostic.severity),
        message: diagnostic.message,
        source: diagnostic.source,
        startLineNumber: diagnostic.range.start.line + 1,
        startColumn: diagnostic.range.start.character + 1,
        endLineNumber: diagnostic.range.end.line + 1,
        endColumn: diagnostic.range.end.character + 1,
      }));
      const model = this.monaco.editor.getModels().find((item) => item.uri.toString() === this.openedUri);
      if (model) this.monaco.editor.setModelMarkers(model, `lsp-${this.language.id}`, markers);
    }
  }
}

export function ensureLspCompletionProvider(monaco: MonacoApi, language: LanguageDefinition) {
  if (registeredCompletionProviders.has(language.monacoLanguage)) return;
  registeredCompletionProviders.add(language.monacoLanguage);

  monaco.languages.registerCompletionItemProvider(language.monacoLanguage, {
    triggerCharacters: ['.', ':', '>', '<', '(', ' ', '_'],
    provideCompletionItems: async (model, position) => {
      const client = clients.get(language.id);
      if (!client) return { suggestions: [] };
      return { suggestions: await client.completions(model, position) };
    },
  });
}

export function attachLanguageServer(
  monaco: MonacoApi,
  editor: Monaco.editor.IStandaloneCodeEditor,
  language: LanguageDefinition,
  statusChanged: (status: LspStatus, detail: string) => void,
) {
  ensureLspCompletionProvider(monaco, language);
  let client = clients.get(language.id);
  if (!client) {
    client = new BrowserLspClient(monaco, language, statusChanged);
    clients.set(language.id, client);
  }

  client.connect();
  const model = editor.getModel();
  if (model) client.didOpen(model);

  let timer: ReturnType<typeof window.setTimeout> | undefined;
  const disposable = editor.onDidChangeModelContent(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const currentModel = editor.getModel();
      if (currentModel) client.didChange(currentModel);
    }, 350);
  });

  return () => {
    disposable.dispose();
    window.clearTimeout(timer);
  };
}
