import type { LanguageId, ProblemStatement } from '@/types/ide';

export function codeStorageKey(problemId: ProblemStatement['problemId'] | undefined, language: LanguageId): LanguageId {
  return problemId ? `${problemId}:${language}` : language;
}

export function codeForLanguage(codeByLanguage: Record<LanguageId, string>, language: LanguageId, problemId?: string): string {
  return codeByLanguage[codeStorageKey(problemId, language)] ?? codeByLanguage[language] ?? '';
}
