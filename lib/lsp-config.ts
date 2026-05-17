import type { LanguageId } from '@/types/ide';

export type LanguageServerConfig = {
  language: LanguageId;
  name: string;
  description: string;
  websocketUrl?: string;
};

export const LANGUAGE_SERVER_CONFIG: Record<LanguageId, LanguageServerConfig> = {
  java: {
    language: 'java',
    name: 'Eclipse JDT Language Server',
    description: 'Open-source Java LSP with Scanner/class/member completions, diagnostics and symbols.',
    websocketUrl: process.env.NEXT_PUBLIC_LSP_JAVA_WS,
  },
  cpp: {
    language: 'cpp',
    name: 'clangd',
    description: 'Open-source C/C++ LSP for completions, diagnostics and semantic navigation.',
    websocketUrl: process.env.NEXT_PUBLIC_LSP_CPP_WS,
  },
  python: {
    language: 'python',
    name: 'Pyright',
    description: 'Open-source Python language server for type-aware completions and diagnostics.',
    websocketUrl: process.env.NEXT_PUBLIC_LSP_PYTHON_WS,
  },
  javascript: {
    language: 'javascript',
    name: 'typescript-language-server',
    description: 'Open-source JavaScript/TypeScript LSP for IntelliSense and diagnostics.',
    websocketUrl: process.env.NEXT_PUBLIC_LSP_JAVASCRIPT_WS,
  },
  rust: {
    language: 'rust',
    name: 'rust-analyzer',
    description: 'Open-source Rust LSP for completions, diagnostics and code intelligence.',
    websocketUrl: process.env.NEXT_PUBLIC_LSP_RUST_WS,
  },
  go: {
    language: 'go',
    name: 'gopls',
    description: 'Open-source Go language server for completions, diagnostics and symbols.',
    websocketUrl: process.env.NEXT_PUBLIC_LSP_GO_WS,
  },
};

export function getLanguageServerConfig(language: LanguageId) {
  return LANGUAGE_SERVER_CONFIG[language];
}
