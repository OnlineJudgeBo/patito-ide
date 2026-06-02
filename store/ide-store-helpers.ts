import { codeStorageKey } from '@/lib/code-storage';
import type { IDEState } from '@/store/ide-state';
import type { LanguageDefinition, LanguageId, ProblemStatement, Testcase, UISettings } from '@/types/ide';

export function updateUi(state: IDEState, ui: Partial<UISettings>) {
  return { ui: { ...state.ui, ...ui } };
}

export function createEmptyTestcase(index: number): Testcase {
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

export function ensureCodeForProblem(
  codeByLanguage: Record<LanguageId, string>,
  languages: readonly LanguageDefinition[],
  problem?: ProblemStatement,
): Record<LanguageId, string> {
  const nextCodeByLanguage = { ...codeByLanguage };
  for (const language of languages) {
    nextCodeByLanguage[codeStorageKey(problem?.problemId, language.id)] ??= nextCodeByLanguage[language.id] ?? language.defaultCode;
  }
  return nextCodeByLanguage;
}
