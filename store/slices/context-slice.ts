import { ensureCodeForProblem } from '@/store/ide-store-helpers';
import type { StoreSet } from '@/store/slices/types';
import type { AllowedLanguageValue, ContextLoadState, JudgeFeatures, LanguageId, ProblemStatement } from '@/types/ide';

export type ContextSlice = {
  launchToken?: string;
  problem?: ProblemStatement;
  contextIdentifiers?: {
    readonly problemId?: number | string;
    readonly contestId?: number | string;
    readonly num?: number;
    readonly languageId?: number | string;
    readonly languageName?: string;
  };
  contextStatus: ContextLoadState;
  contextError?: string;
  judgeFeatures: JudgeFeatures;
  allowedLanguages?: readonly AllowedLanguageValue[];
  judgeLanguageIds: Partial<Record<LanguageId, number>>;
  setLaunchToken: (token?: string) => void;
  setProblem: (problem?: ProblemStatement) => void;
  setContextIdentifiers: (identifiers?: ContextSlice['contextIdentifiers']) => void;
  setContextStatus: (status: ContextLoadState, error?: string) => void;
  setJudgeFeatures: (features: JudgeFeatures) => void;
  setAllowedLanguages: (allowedLanguages?: readonly AllowedLanguageValue[]) => void;
  setJudgeLanguageIds: (judgeLanguageIds: Partial<Record<LanguageId, number>>) => void;
};

export function createContextSlice(set: StoreSet): ContextSlice {
  return {
    launchToken: undefined,
    problem: undefined,
    contextIdentifiers: undefined,
    contextStatus: 'demo',
    contextError: undefined,
    judgeFeatures: { run: true, submit: true, polling: true, websocket: false, lsp: true },
    allowedLanguages: undefined,
    judgeLanguageIds: {},
    setLaunchToken: (token) => set({ launchToken: token }),
    setProblem: (problem) =>
      set((state) => {
        const codeByLanguage = ensureCodeForProblem(state.codeByLanguage, state.availableLanguages, problem);
        return { problem, codeByLanguage };
      }),
    setContextIdentifiers: (contextIdentifiers) => set({ contextIdentifiers }),
    setContextStatus: (contextStatus, contextError) => set({ contextStatus, contextError }),
    setJudgeFeatures: (judgeFeatures) => set({ judgeFeatures }),
    setAllowedLanguages: (allowedLanguages) => set({ allowedLanguages }),
    setJudgeLanguageIds: (judgeLanguageIds) => set({ judgeLanguageIds }),
  };
}
