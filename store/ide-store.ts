'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createInitialCode,
  defaultCodeFor,
  IDE_STORAGE_KEY,
  initialExecution,
  initialSelectedLanguage,
  initialTestcases,
  initialUiSettings,
} from '@/store/ide-defaults';
import type { ExecutionResult, LanguageId, Testcase, UISettings } from '@/types/ide';

type IDEState = {
  selectedLanguage: LanguageId;
  codeByLanguage: Record<LanguageId, string>;
  stdin: string;
  execution: ExecutionResult;
  testcases: readonly Testcase[];
  ui: UISettings;
  setLanguage: (language: LanguageId) => void;
  setCode: (language: LanguageId, code: string) => void;
  resetCode: (language: LanguageId) => void;
  setStdin: (stdin: string) => void;
  setExecution: (execution: Partial<ExecutionResult>) => void;
  addLog: (log: string) => void;
  setTestcases: (testcases: readonly Testcase[]) => void;
  updateTestcase: (id: string, testcase: Partial<Testcase>) => void;
  addTestcase: () => void;
  removeTestcase: (id: string) => void;
  setBottomPanelHeight: (height: number) => void;
  setColorTheme: (theme: UISettings['colorTheme']) => void;
  setSidebarWidth: (width: number) => void;
  toggleMinimap: () => void;
  toggleSidebar: () => void;
};

function updateUi(state: IDEState, ui: Partial<UISettings>) {
  return { ui: { ...state.ui, ...ui } };
}

function createEmptyTestcase(index: number): Testcase {
  return {
    id: crypto.randomUUID(),
    name: `Test ${index}`,
    input: '',
    expectedOutput: '',
    actualOutput: '',
    status: 'idle',
    expanded: true,
  };
}

export const useIDEStore = create<IDEState>()(
  persist(
    (set) => ({
      selectedLanguage: initialSelectedLanguage,
      codeByLanguage: createInitialCode(),
      stdin: '5\n',
      execution: initialExecution,
      testcases: initialTestcases,
      ui: initialUiSettings,
      setLanguage: (language) => set({ selectedLanguage: language }),
      setCode: (language, code) => set((state) => ({ codeByLanguage: { ...state.codeByLanguage, [language]: code } })),
      resetCode: (language) => {
        set((state) => ({ codeByLanguage: { ...state.codeByLanguage, [language]: defaultCodeFor(language) } }));
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
          testcases: [...state.testcases, createEmptyTestcase(state.testcases.length + 1)],
        })),
      removeTestcase: (id) => set((state) => ({ testcases: state.testcases.filter((testcase) => testcase.id !== id) })),
      setBottomPanelHeight: (height) => set((state) => updateUi(state, { bottomPanelHeight: height })),
      setColorTheme: (theme) => set((state) => updateUi(state, { colorTheme: theme })),
      setSidebarWidth: (width) => set((state) => updateUi(state, { sidebarWidth: width })),
      toggleMinimap: () => set((state) => updateUi(state, { minimap: !state.ui.minimap })),
      toggleSidebar: () => set((state) => updateUi(state, { sidebarCollapsed: !state.ui.sidebarCollapsed })),
    }),
    {
      name: IDE_STORAGE_KEY,
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
