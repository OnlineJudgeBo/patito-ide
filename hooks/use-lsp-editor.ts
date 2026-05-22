'use client';

import type { OnMount } from '@monaco-editor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { defineCompetitiveEditorThemes } from '@/lib/editor-themes';
import { attachLanguageServer } from '@/lsp/monaco-adapter';
import type { LspStatus } from '@/lsp/types';
import type { LanguageDefinition } from '@/types/ide';

type MonacoEditorInstance = Parameters<OnMount>[0];
type MonacoApi = Parameters<OnMount>[1];

type LspState = {
  readonly status: LspStatus;
  readonly detail: string;
};

const initialLspState: LspState = {
  status: 'disabled',
  detail: 'Language server not connected.',
};

export function useLspEditor(language: LanguageDefinition, editorTheme: string) {
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const monacoRef = useRef<MonacoApi | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [lspState, setLspState] = useState(initialLspState);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      defineCompetitiveEditorThemes(monaco);
      monaco.editor.setTheme(editorTheme);

      setEditorReady(true);
      editor.focus();
    },
    [editorTheme],
  );

  useEffect(() => {
    monacoRef.current?.editor.setTheme(editorTheme);
  }, [editorTheme]);

  useEffect(() => {
    if (!editorReady || !editorRef.current || !monacoRef.current) return undefined;

    return attachLanguageServer(monacoRef.current, editorRef.current, language, (status, detail) => {
      setLspState({ status, detail });
    });
  }, [editorReady, language]);

  return { handleMount, lspState } as const;
}
