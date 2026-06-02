'use client';

import { useCallback, useState } from 'react';
import { useCodeDownload } from '@/hooks/judge/use-code-download';
import { useCodePayload } from '@/hooks/judge/use-code-payload';
import { useLanguagePermission } from '@/hooks/judge/use-language-permission';
import { useRunAction } from '@/hooks/judge/use-run-action';
import { useSubmitAction } from '@/hooks/judge/use-submit-action';
import type { BusyAction, JudgeActionOptions } from '@/hooks/judge/types';
import { useIDEStore } from '@/store/ide-store';

export function useJudgeActions({ notify }: JudgeActionOptions) {
  const addLog = useIDEStore((state) => state.addLog);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const payload = useCodePayload();
  const ensureAllowedLanguage = useLanguagePermission(notify);

  const run = useRunAction({ payload, ensureAllowedLanguage, setBusyAction, notify });
  const submit = useSubmitAction({ payload, ensureAllowedLanguage, setBusyAction, notify });
  const download = useCodeDownload(notify);

  const save = useCallback(() => {
    addLog('Workspace guardado localmente.');
    notify('Guardado localmente.');
  }, [addLog, notify]);

  return { busyAction, run, submit, save, download } as const;
}
