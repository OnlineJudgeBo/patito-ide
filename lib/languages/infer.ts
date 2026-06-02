import { DEFAULT_LANGUAGE_ID } from '@/lib/languages/builtins';
import type { LanguageId } from '@/types/ide';

export function isLanguageId(value: string): value is LanguageId {
  return value.trim().length > 0;
}

export function inferLanguageId(value: string): LanguageId {
  const normalized = value.toLowerCase().trim();
  if (normalized.includes('c++') || normalized.includes('cpp')) return 'cpp';
  if (normalized.includes('python')) return 'python';
  if (normalized.includes('java') && !normalized.includes('script')) return 'java';
  if (normalized.includes('javascript') || normalized.includes('node')) return 'javascript';
  if (normalized.includes('rust')) return 'rust';
  if (normalized === 'go' || normalized.includes('golang')) return 'go';
  return normalized.replace(/[^a-z0-9_-]+/g, '-') || DEFAULT_LANGUAGE_ID;
}
