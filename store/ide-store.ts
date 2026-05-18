'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LANGUAGES } from '@/lib/languages';
import type { ExecutionResult, LanguageId, Testcase } from '@/types/ide';

const initialCode = Object.fromEntries(LANGUAGES.map((language) => [language.id, language.defaultCode])) as Record<LanguageId, string>;

const initialTestcases: Testcase[] = [
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

const initialExecution: ExecutionResult = {
  phase: 'idle',
  verdict: 'Pending',
  stdout: '',
  stderr: '',
  compileErrors: '',
  logs: ['Ready. Use Ctrl + Enter to run or Ctrl + Shift + Enter to submit.'],
};

type UISettings = {
  bottomPanelHeight: number;
  minimap: boolean;
  sidebarCollapsed: boolean;
};

type IDEState = {
  selectedLanguage: LanguageId;
  codeByLanguage: Record<LanguageId, string>;
  stdin: string;
  execution: ExecutionResult;
  testcases: Testcase[];
  ui: UISettings;
  setLanguage: (language: LanguageId) => void;
  setCode: (language: LanguageId, code: string) => void;
  resetCode: (language: LanguageId) => void;
  setStdin: (stdin: string) => void;
  setExecution: (execution: Partial<ExecutionResult>) => void;
  addLog: (log: string) => void;
  setTestcases: (testcases: Testcase[]) => void;
  updateTestcase: (id: string, testcase: Partial<Testcase>) => void;
  addTestcase: () => void;
  removeTestcase: (id: string) => void;
  setBottomPanelHeight: (height: number) => void;
  toggleMinimap: () => void;
  toggleSidebar: () => void;
};

export const useIDEStore = create<IDEState>()(
  persist(
    (set, get) => ({
      selectedLanguage: 'cpp',
      codeByLanguage: initialCode,
      stdin: '5\n',
      execution: initialExecution,
      testcases: initialTestcases,
      ui: {
        bottomPanelHeight: 300,
        minimap: false,
        sidebarCollapsed: false,
      },
      setLanguage: (language) => set({ selectedLanguage: language }),
      setCode: (language, code) => set((state) => ({ codeByLanguage: { ...state.codeByLanguage, [language]: code } })),
      resetCode: (language) => {
        const template = LANGUAGES.find((item) => item.id === language)?.defaultCode ?? '';
        set((state) => ({ codeByLanguage: { ...state.codeByLanguage, [language]: template } }));
      },
      setStdin: (stdin) => set({ stdin }),
      setExecution: (execution) => set((state) => ({ execution: { ...state.execution, ...execution } })),
      addLog: (log) => set((state) => ({ execution: { ...state.execution, logs: [...state.execution.logs, log] } })),
      setTestcases: (testcases) => set({ testcases }),
      updateTestcase: (id, testcase) =>
        set((state) => ({
          testcases: state.testcases.map((item) => (item.id === id ? { ...item, ...testcase } : item)),
        })),
      addTestcase: () =>
        set((state) => ({
          testcases: [
            ...state.testcases,
            {
              id: crypto.randomUUID(),
              name: `Test ${state.testcases.length + 1}`,
              input: '',
              expectedOutput: '',
              actualOutput: '',
              status: 'idle',
              expanded: true,
            },
          ],
        })),
      removeTestcase: (id) => set((state) => ({ testcases: state.testcases.filter((testcase) => testcase.id !== id) })),
      setBottomPanelHeight: (height) => set((state) => ({ ui: { ...state.ui, bottomPanelHeight: height } })),
      toggleMinimap: () => set((state) => ({ ui: { ...state.ui, minimap: !state.ui.minimap } })),
      toggleSidebar: () => set((state) => ({ ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } })),
    }),
    {
      name: 'vibe-competitive-ide',
      partialize: (state) => ({
        selectedLanguage: state.selectedLanguage,
        codeByLanguage: state.codeByLanguage,
        stdin: state.stdin,
        testcases: state.testcases,
        ui: state.ui,
      }),
    },
  ),
);

export function getCurrentCode() {
  const state = useIDEStore.getState();
  return state.codeByLanguage[state.selectedLanguage];
}
