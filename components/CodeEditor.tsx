'use client';

import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';
import { useCallback } from 'react';
import { getLanguage } from '@/lib/languages';
import { useIDEStore } from '@/store/ide-store';
import { registerCompetitiveCompletions } from '@/lib/editor-completions';

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

  const handleMount: OnMount = useCallback((editor, monaco) => {
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

    editor.focus();
  }, []);

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-panel">
      <div className="flex h-10 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 text-xs text-slate-400">
        <span className="font-mono text-slate-200">main.{language.extension}</span>
        <span>Ctrl+Space IntelliSense · Scanner-aware Java autocomplete · Ctrl+Enter Run</span>
      </div>
      <MonacoEditor
        height="calc(100% - 40px)"
        path={`main.${language.extension}`}
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
          scrollBeyondLastLine: false,
          snippetSuggestions: 'top',
          smoothScrolling: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}
