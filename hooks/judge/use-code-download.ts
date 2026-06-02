'use client';

import { useCallback } from 'react';
import { codeForLanguage } from '@/lib/code-storage';
import { getLanguage } from '@/lib/language-options';
import { downloadTextFile } from '@/services/download-file';
import { useIDEStore } from '@/store/ide-store';

export function useCodeDownload(notify: (message: string) => void) {
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const availableLanguages = useIDEStore((state) => state.availableLanguages);
  const codeByLanguage = useIDEStore((state) => state.codeByLanguage);
  const problem = useIDEStore((state) => state.problem);

  return useCallback(() => {
    const language = getLanguage(selectedLanguage, availableLanguages);
    const fileName = `main.${language.extension}`;
    downloadTextFile(fileName, codeForLanguage(codeByLanguage, selectedLanguage, problem?.problemId));
    notify(`Código descargado como ${fileName}.`);
  }, [availableLanguages, codeByLanguage, notify, problem?.problemId, selectedLanguage]);
}
