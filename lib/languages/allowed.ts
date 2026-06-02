import type { AllowedLanguageValue, LanguageDefinition } from '@/types/ide';

function normalizeComparableLanguageValue(value: string | number | undefined | null) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9#+._-]/g, '');
}

function languageComparisonKeys(language: LanguageDefinition): readonly string[] {
  return [
    language.id,
    language.label,
    language.monacoLanguage,
    language.judgeLanguage,
    language.extension,
    language.judgeLanguageId,
  ]
    .map(normalizeComparableLanguageValue)
    .filter(Boolean);
}

export function languageMatchesAllowedValue(language: LanguageDefinition, allowedLanguage: AllowedLanguageValue): boolean {
  const allowed = normalizeComparableLanguageValue(allowedLanguage);
  return languageComparisonKeys(language).some((candidate) => candidate === allowed);
}

/**
 * Returns:
 * - true when the judge did not restrict languages or this language matches the allowlist.
 * - false when the allowlist is comparable to the language metadata and does not match.
 * - undefined when the API only sent opaque numeric ids but this IDE has no matching
 *   judgeLanguageId metadata; in that case the UI should not block locally.
 */
export function getLanguageAllowedState(language: LanguageDefinition, allowedLanguages?: readonly AllowedLanguageValue[]): boolean | undefined {
  if (!allowedLanguages?.length) return true;
  if (allowedLanguages.some((allowedLanguage) => languageMatchesAllowedValue(language, allowedLanguage))) return true;

  const hasOnlyOpaqueNumericIds = allowedLanguages.every((allowedLanguage) => typeof allowedLanguage === 'number' || /^\d+$/.test(String(allowedLanguage).trim()));
  if (hasOnlyOpaqueNumericIds && language.judgeLanguageId === undefined) return undefined;

  return false;
}

export function firstAllowedLanguage(languages: readonly LanguageDefinition[], allowedLanguages?: readonly AllowedLanguageValue[]): LanguageDefinition | undefined {
  return languages.find((language) => getLanguageAllowedState(language, allowedLanguages) === true);
}

export function findLanguageByAllowedValue(languages: readonly LanguageDefinition[], value: AllowedLanguageValue | undefined | null): LanguageDefinition | undefined {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  return languages.find((language) => languageMatchesAllowedValue(language, value));
}
