import type * as Monaco from 'monaco-editor';
import type { ColorTheme } from '@/types/ide';

type MonacoApi = typeof Monaco;

export type EditorThemeName = 'vibe-judge-dark' | 'vibe-judge-light' | 'vibe-judge-hacker';

const editorThemeByColorTheme: Readonly<Record<ColorTheme, EditorThemeName>> = {
  dark: 'vibe-judge-dark',
  light: 'vibe-judge-light',
  hacker: 'vibe-judge-hacker',
};

export function editorThemeFor(colorTheme: ColorTheme): EditorThemeName {
  return editorThemeByColorTheme[colorTheme];
}

export function defineCompetitiveEditorThemes(monaco: MonacoApi) {
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
      'editorSuggestWidget.background': '#020617',
      'editorSuggestWidget.border': '#38bdf8',
      'editorSuggestWidget.foreground': '#cbd5e1',
      'editorSuggestWidget.highlightForeground': '#facc15',
      'editorSuggestWidget.selectedBackground': '#075985',
      'editorSuggestWidget.selectedForeground': '#f8fafc',
      'editorSuggestWidget.focusHighlightForeground': '#fde68a',
      'list.activeSelectionBackground': '#075985',
      'list.activeSelectionForeground': '#f8fafc',
      'list.focusBackground': '#0c4a6e',
      'list.focusForeground': '#f8fafc',
      'list.highlightForeground': '#facc15',
      'list.hoverBackground': '#1e293b',
    },
  });

  monaco.editor.defineTheme('vibe-judge-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0369a1' },
      { token: 'number', foreground: 'b45309' },
      { token: 'string', foreground: '15803d' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#0f172a',
      'editorLineNumber.foreground': '#94a3b8',
      'editorCursor.foreground': '#0284c7',
      'editor.selectionBackground': '#bae6fd',
      'editorSuggestWidget.background': '#ffffff',
      'editorSuggestWidget.border': '#0284c7',
      'editorSuggestWidget.foreground': '#0f172a',
      'editorSuggestWidget.highlightForeground': '#b45309',
      'editorSuggestWidget.selectedBackground': '#dbeafe',
      'editorSuggestWidget.selectedForeground': '#0f172a',
      'editorSuggestWidget.focusHighlightForeground': '#92400e',
      'list.activeSelectionBackground': '#dbeafe',
      'list.activeSelectionForeground': '#0f172a',
      'list.focusBackground': '#e0f2fe',
      'list.focusForeground': '#0f172a',
      'list.highlightForeground': '#b45309',
      'list.hoverBackground': '#f1f5f9',
    },
  });

  monaco.editor.defineTheme('vibe-judge-hacker', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '00ff66', fontStyle: 'bold' },
      { token: 'number', foreground: 'b6ff00' },
      { token: 'string', foreground: '39ff14' },
      { token: 'comment', foreground: '00a33c' },
      { token: 'type', foreground: '7cff7c' },
      { token: 'identifier', foreground: 'b7ffcf' },
    ],
    colors: {
      'editor.background': '#000b05',
      'editor.foreground': '#b7ffcf',
      'editorLineNumber.foreground': '#00a33c',
      'editorLineNumber.activeForeground': '#39ff14',
      'editorCursor.foreground': '#39ff14',
      'editor.selectionBackground': '#00ff6640',
      'editor.inactiveSelectionBackground': '#00ff6628',
      'editor.lineHighlightBackground': '#003b141f',
      'editorIndentGuide.background1': '#064e3b',
      'editorIndentGuide.activeBackground1': '#39ff14',
      'editorSuggestWidget.background': '#000b05',
      'editorSuggestWidget.border': '#39ff14',
      'editorSuggestWidget.foreground': '#b7ffcf',
      'editorSuggestWidget.highlightForeground': '#b6ff00',
      'editorSuggestWidget.selectedBackground': '#064e3b',
      'editorSuggestWidget.selectedForeground': '#ecfccb',
      'editorSuggestWidget.focusHighlightForeground': '#ccff33',
      'list.activeSelectionBackground': '#064e3b',
      'list.activeSelectionForeground': '#ecfccb',
      'list.focusBackground': '#052e16',
      'list.focusForeground': '#ecfccb',
      'list.highlightForeground': '#b6ff00',
      'list.hoverBackground': '#001f0d',
    },
  });
}

export function competitiveEditorOptions(minimapEnabled: boolean): Monaco.editor.IStandaloneEditorConstructionOptions {
  return {
    automaticLayout: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    bracketPairColorization: { enabled: true },
    fontFamily: 'JetBrains Mono, Fira Code, Menlo, monospace',
    fontLigatures: true,
    fontSize: 14,
    lineNumbers: 'on',
    minimap: { enabled: minimapEnabled },
    quickSuggestions: true,
    parameterHints: { enabled: true },
    scrollBeyondLastLine: false,
    suggest: {
      preview: true,
      selectionMode: 'always',
      showInlineDetails: true,
      showStatusBar: true,
    },
    snippetSuggestions: 'none',
    smoothScrolling: true,
    tabSize: 2,
    wordWrap: 'on',
  };
}
