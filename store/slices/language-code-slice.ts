import { codeStorageKey } from '@/lib/code-storage';
import { BUILTIN_LANGUAGES } from '@/lib/language-options';
import { createInitialCode, defaultCodeFor, initialSelectedLanguage } from '@/store/ide-defaults';
import { ensureCodeForProblem } from '@/store/ide-store-helpers';
import type { StoreSet } from '@/store/slices/types';
import type { LanguageDefinition, LanguageId } from '@/types/ide';

export type LanguageCodeSlice = {
  selectedLanguage: LanguageId;
  availableLanguages: readonly LanguageDefinition[];
  codeByLanguage: Record<LanguageId, string>;
  setLanguage: (language: LanguageId) => void;
  setAvailableLanguages: (languages: readonly LanguageDefinition[]) => void;
  setCode: (language: LanguageId, code: string) => void;
  resetCode: (language: LanguageId) => void;
};

export function createLanguageCodeSlice(set: StoreSet): LanguageCodeSlice {
  return {
    selectedLanguage: initialSelectedLanguage,
    availableLanguages: BUILTIN_LANGUAGES,
    codeByLanguage: createInitialCode(),
    setLanguage: (language) => set({ selectedLanguage: language }),
    setAvailableLanguages: (languages) =>
      set((state) => {
        const codeByLanguage = ensureCodeForProblem(state.codeByLanguage, languages, state.problem);
        const selectedLanguage = languages.some((language) => language.id === state.selectedLanguage) ? state.selectedLanguage : (languages[0]?.id ?? initialSelectedLanguage);
        return { availableLanguages: languages, codeByLanguage, selectedLanguage };
      }),
    setCode: (language, code) => set((state) => ({ codeByLanguage: { ...state.codeByLanguage, [codeStorageKey(state.problem?.problemId, language)]: code } })),
    resetCode: (language) => {
      set((state) => ({ codeByLanguage: { ...state.codeByLanguage, [codeStorageKey(state.problem?.problemId, language)]: defaultCodeFor(language, state.availableLanguages) } }));
    },
  };
}
