import { BUILTIN_LANGUAGES } from '@/lib/languages/builtins';
import { inferLanguageId } from '@/lib/languages/infer';
import { builtinById, builtinByMonaco } from '@/lib/languages/registry';
import type { ApiLanguageDefinition, LanguageDefinition } from '@/types/ide';

export function languageFromApi(value: ApiLanguageDefinition): LanguageDefinition | undefined {
  const languageHint = value.name ?? value.label ?? value.judgeLanguage ?? value.id ?? value.monacoLanguage ?? '';
  const inferredId = languageHint ? inferLanguageId(languageHint) : undefined;
  const explicitId = value.ideLanguage ?? value.id;
  const fallback = builtinById(explicitId ?? '') ?? builtinById(inferredId ?? '') ?? builtinByMonaco(value.monacoLanguage ?? '');

  const id = explicitId ?? fallback?.id ?? inferredId ?? (value.judgeLanguageId !== undefined ? `judge-${value.judgeLanguageId}` : undefined);
  if (!id) return undefined;

  return {
    id,
    label: value.label ?? value.name ?? fallback?.label ?? id,
    monacoLanguage: value.monacoLanguage ?? fallback?.monacoLanguage ?? id,
    judgeLanguage: value.judgeLanguage ?? value.name ?? fallback?.judgeLanguage ?? id,
    extension: value.extension ?? fallback?.extension ?? 'txt',
    defaultCode: value.template ?? value.defaultCode ?? fallback?.defaultCode ?? '',
    judgeLanguageId: value.judgeLanguageId,
  };
}

export function mergeApiLanguages(apiLanguages: readonly ApiLanguageDefinition[] | undefined): readonly LanguageDefinition[] {
  if (!apiLanguages?.length) return BUILTIN_LANGUAGES;

  const normalized = apiLanguages.map(languageFromApi).filter((language): language is LanguageDefinition => Boolean(language));
  if (!normalized.length) return BUILTIN_LANGUAGES;

  const merged = new Map<string, LanguageDefinition>();
  for (const language of normalized) merged.set(language.id, language);
  return [...merged.values()];
}
