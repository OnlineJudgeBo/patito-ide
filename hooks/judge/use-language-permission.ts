'use client';

import { useCallback } from 'react';
import { getLanguage, getLanguageAllowedState } from '@/lib/language-options';
import { useIDEStore } from '@/store/ide-store';

export function useLanguagePermission(notify: (message: string) => void) {
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const availableLanguages = useIDEStore((state) => state.availableLanguages);
  const allowedLanguages = useIDEStore((state) => state.allowedLanguages);
  const setExecution = useIDEStore((state) => state.setExecution);

  return useCallback(() => {
    const language = getLanguage(selectedLanguage, availableLanguages);
    if (getLanguageAllowedState(language, allowedLanguages) !== false) return true;

    const message = `${language.label} no está habilitado por el juez para este problema.`;
    setExecution({ phase: 'error', verdict: 'Internal Error', logs: [message] });
    notify(message);
    return false;
  }, [allowedLanguages, availableLanguages, notify, selectedLanguage, setExecution]);
}
