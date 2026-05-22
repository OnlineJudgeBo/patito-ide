import { createDefaultCodeByLanguage, DEFAULT_LANGUAGE_ID, defaultCodeFor } from '@/lib/language-options';
import type { ExecutionResult, Testcase, UISettings } from '@/types/ide';

export const IDE_STORAGE_KEY = 'vibe-competitive-ide';

export const initialTestcases: readonly Testcase[] = [
  {
    id: 'sample-1',
    name: 'Sample 1',
    input: '5\n',
    expectedOutput: '5\n',
    actualOutput: '',
    status: 'idle',
    expanded: true,
  },
  {
    id: 'edge-1',
    name: 'Edge case',
    input: '1\n',
    expectedOutput: '1\n',
    actualOutput: '',
    status: 'idle',
    expanded: false,
  },
];

export const initialExecution: ExecutionResult = {
  phase: 'idle',
  verdict: 'Pending',
  stdout: '',
  stderr: '',
  compileErrors: '',
  logs: ['Ready. Use Ctrl + Enter to run or Ctrl + Shift + Enter to submit.'],
};

export const initialUiSettings: UISettings = {
  bottomPanelHeight: 300,
  colorTheme: 'dark',
  minimap: false,
  sidebarWidth: 320,
  sidebarCollapsed: false,
};

export function createInitialCode() {
  return createDefaultCodeByLanguage();
}

export { defaultCodeFor };

export const initialSelectedLanguage = DEFAULT_LANGUAGE_ID;
