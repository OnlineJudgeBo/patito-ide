'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { codeForLanguage } from '@/lib/code-storage';
import { IDE_STORAGE_KEY } from '@/store/ide-defaults';
import type { IDEState } from '@/store/ide-state';
import { createContextSlice } from '@/store/slices/context-slice';
import { createExecutionSlice } from '@/store/slices/execution-slice';
import { createLanguageCodeSlice } from '@/store/slices/language-code-slice';
import { createTestcaseSlice } from '@/store/slices/testcase-slice';
import { createUiSlice } from '@/store/slices/ui-slice';


export const useIDEStore = create<IDEState>()(
  persist(
    (set) => ({
      ...createLanguageCodeSlice(set),
      ...createContextSlice(set),
      ...createExecutionSlice(set),
      ...createTestcaseSlice(set),
      ...createUiSlice(set),
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
  return codeForLanguage(state.codeByLanguage, state.selectedLanguage, state.problem?.problemId);
}
