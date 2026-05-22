'use client';

import dynamic from 'next/dynamic';
import { LspStatusBadge } from '@/components/LspStatusBadge';
import { useLspEditor } from '@/hooks/use-lsp-editor';
import { competitiveEditorOptions, editorThemeFor } from '@/lib/editor-themes';
import { getLanguage } from '@/lib/language-options';
import { getLanguageServerConfig } from '@/lsp/config';
import { lspDocumentFileName } from '@/lsp/document-uri';
import { useIDEStore } from '@/store/ide-store';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse rounded-2xl bg-slate-900" />,
});

export function CodeEditor() {
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const code = useIDEStore((state) => state.codeByLanguage[state.selectedLanguage]);
  const setCode = useIDEStore((state) => state.setCode);
  const ui = useIDEStore((state) => state.ui);
  const language = getLanguage(selectedLanguage);
  const fileName = lspDocumentFileName(language);
  const lspConfig = getLanguageServerConfig(selectedLanguage);
  const editorTheme = editorThemeFor(ui.colorTheme);
  const editorOptions = competitiveEditorOptions(ui.minimap);
  const { handleMount, lspState } = useLspEditor(language, editorTheme);

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-panel">
      <div className="flex h-10 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 text-xs text-slate-400">
        <span className="font-mono text-slate-200">{fileName}</span>
        <span className="hidden md:inline">Ctrl+Space IntelliSense · Scanner-aware Java autocomplete · Ctrl+Enter Run</span>
        <LspStatusBadge status={lspState.status} detail={lspState.detail} serverName={lspConfig.name} />
      </div>
      <MonacoEditor
        height="calc(100% - 40px)"
        path={fileName}
        language={language.monacoLanguage}
        value={code}
        theme={editorTheme}
        onMount={handleMount}
        onChange={(value) => setCode(selectedLanguage, value ?? '')}
        options={editorOptions}
      />
    </div>
  );
}
