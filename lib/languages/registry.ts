import { BUILTIN_LANGUAGES } from '@/lib/languages/builtins';
import type { LanguageDefinition, LanguageId } from '@/types/ide';

const byId = new Map<string, LanguageDefinition>(BUILTIN_LANGUAGES.map((language) => [language.id, language]));
const byMonaco = new Map<string, LanguageDefinition>(BUILTIN_LANGUAGES.map((language) => [language.monacoLanguage, language]));

export function builtinById(languageId: string | undefined): LanguageDefinition | undefined {
  return languageId ? byId.get(languageId) : undefined;
}

export function builtinByMonaco(monacoLanguage: string | undefined): LanguageDefinition | undefined {
  return monacoLanguage ? byMonaco.get(monacoLanguage) : undefined;
}

export function getLanguage(languageId: LanguageId, availableLanguages: readonly LanguageDefinition[] = BUILTIN_LANGUAGES): LanguageDefinition {
  return availableLanguages.find((language) => language.id === languageId) ?? builtinById(languageId) ?? BUILTIN_LANGUAGES[0];
}

export function createDefaultCodeByLanguage(languages: readonly LanguageDefinition[] = BUILTIN_LANGUAGES): Record<LanguageId, string> {
  return languages.reduce(
    (codeByLanguage, language) => ({ ...codeByLanguage, [language.id]: language.defaultCode }),
    {} as Record<LanguageId, string>,
  );
}

export function defaultCodeFor(languageId: LanguageId, availableLanguages: readonly LanguageDefinition[] = BUILTIN_LANGUAGES): string {
  return getLanguage(languageId, availableLanguages).defaultCode;
}
