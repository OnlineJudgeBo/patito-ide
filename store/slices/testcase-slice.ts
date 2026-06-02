import { initialTestcases } from '@/store/ide-defaults';
import { createEmptyTestcase } from '@/store/ide-store-helpers';
import type { StoreSet } from '@/store/slices/types';
import type { Testcase } from '@/types/ide';

export type TestcaseSlice = {
  testcases: readonly Testcase[];
  setTestcases: (testcases: readonly Testcase[]) => void;
  updateTestcase: (id: string, testcase: Partial<Testcase>) => void;
  addTestcase: () => void;
  removeTestcase: (id: string) => void;
};

export function createTestcaseSlice(set: StoreSet): TestcaseSlice {
  return {
    testcases: initialTestcases,
    setTestcases: (testcases) => set({ testcases }),
    updateTestcase: (id, testcase) =>
      set((state) => ({
        testcases: state.testcases.map((item: Testcase) => (item.id === id ? { ...item, ...testcase } : item)),
      })),
    addTestcase: () =>
      set((state) => ({
        testcases: [...state.testcases, createEmptyTestcase(state.testcases.length + 1)],
      })),
    removeTestcase: (id) => set((state) => ({ testcases: state.testcases.filter((testcase: Testcase) => testcase.id !== id) })),
  };
}
