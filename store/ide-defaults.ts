import { createDefaultCodeByLanguage, DEFAULT_LANGUAGE_ID, defaultCodeFor } from '@/lib/language-options';
import type { ExecutionResult, Testcase, UISettings } from '@/types/ide';

export const IDE_STORAGE_KEY = 'vibe-competitive-ide';

export const initialTestcases: readonly Testcase[] = [
  {
    id: 'sample-1',
    name: 'Caso de ejemplo 1',
    input: '',
    expectedOutput: '',
    actualOutput: '',
    status: 'idle',
    expanded: true,
  },
];

export const initialExecution: ExecutionResult = {
  phase: 'idle',
  verdict: 'Pending',
  stdout: '',
  stderr: '',
  compileErrors: '',
  logs: [],
};

export const initialUiSettings: UISettings = {
  bottomPanelHeight: 280,
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
