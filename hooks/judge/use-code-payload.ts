'use client';

import { useMemo } from 'react';
import { codeForLanguage } from '@/lib/code-storage';
import { useIDEStore } from '@/store/ide-store';

export function useCodePayload() {
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const codeByLanguage = useIDEStore((state) => state.codeByLanguage);
  const stdin = useIDEStore((state) => state.stdin);
  const judgeLanguageIds = useIDEStore((state) => state.judgeLanguageIds);
  const problem = useIDEStore((state) => state.problem);
  const testcases = useIDEStore((state) => state.testcases);

  return useMemo(() => {
    const judgeLanguageId = judgeLanguageIds[selectedLanguage];
    return {
      sourceCode: codeForLanguage(codeByLanguage, selectedLanguage, problem?.problemId),
      language: selectedLanguage,
      languageId: judgeLanguageId ?? undefined,
      stdin,
      testcases,
    };
  }, [codeByLanguage, judgeLanguageIds, problem?.problemId, selectedLanguage, stdin, testcases]);
}
