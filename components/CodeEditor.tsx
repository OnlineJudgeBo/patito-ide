'use client';

import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getLanguage } from '@/lib/languages';
import { useIDEStore } from '@/store/ide-store';
import { registerCompetitiveCompletions } from '@/lib/editor-completions';
import { getLanguageServerConfig } from '@/lsp/config';
import { lspDocumentFileName } from '@/lsp/document-uri';
import { attachLanguageServer } from '@/lsp/monaco-adapter';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse rounded-2xl bg-slate-900" />,
});

export function CodeEditor() {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [lspStatus, setLspStatus] = useState({ state: 'disabled', detail: 'Language server not connected.' });
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const code = useIDEStore((state) => state.codeByLanguage[state.selectedLanguage]);
  const setCode = useIDEStore((state) => state.setCode);
  const ui = useIDEStore((state) => state.ui);
  const language = getLanguage(selectedLanguage);
  const fileName = lspDocumentFileName(language);
  const lspConfig = getLanguageServerConfig(selectedLanguage);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.defineTheme('vibe-judge-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '7dd3fc' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'string', foreground: '86efac' },
      ],
      colors: {
        'editor.background': '#0b1220',
        'editorLineNumber.foreground': '#475569',
        'editorCursor.foreground': '#38bdf8',
        'editor.selectionBackground': '#0ea5e944',
      },
    });
    monaco.editor.setTheme('vibe-judge-dark');

    registerCompetitiveCompletions(monaco);

    setEditorReady(true);
    editor.focus();
  }, []);

  useEffect(() => {
    if (!editorReady || !editorRef.current || !monacoRef.current) return undefined;

    return attachLanguageServer(monacoRef.current, editorRef.current, language, (state, detail) => {
      setLspStatus({ state, detail });
    });
  }, [editorReady, language]);

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-panel">
      <div className="flex h-10 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 text-xs text-slate-400">
        <span className="font-mono text-slate-200">{fileName}</span>
        <span className="hidden md:inline">Ctrl+Space IntelliSense · Scanner-aware Java autocomplete · Ctrl+Enter Run</span>
        <span
          title={lspStatus.detail}
          className={`rounded-full border px-2 py-1 font-semibold ${
            lspStatus.state === 'connected'
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
              : lspStatus.state === 'connecting'
                ? 'border-sky-400/30 bg-sky-400/10 text-sky-300'
                : lspStatus.state === 'error'
                  ? 'border-rose-400/30 bg-rose-400/10 text-rose-300'
                  : 'border-slate-700 bg-slate-900 text-slate-500'
          }`}
        >
          LSP: {lspConfig.name}
        </span>
      </div>
      <MonacoEditor
        height="calc(100% - 40px)"
        path={fileName}
        language={language.monacoLanguage}
        value={code}
        theme="vibe-judge-dark"
        onMount={handleMount}
        onChange={(value) => setCode(selectedLanguage, value ?? '')}
        options={{
          automaticLayout: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          bracketPairColorization: { enabled: true },
          fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
          fontLigatures: true,
          fontSize: 14,
          lineNumbers: 'on',
          minimap: { enabled: ui.minimap },
          quickSuggestions: true,
          parameterHints: { enabled: true },
          scrollBeyondLastLine: false,
          suggest: {
            preview: true,
            showInlineDetails: true,
            showStatusBar: true,
          },
          snippetSuggestions: 'top',
          smoothScrolling: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}
