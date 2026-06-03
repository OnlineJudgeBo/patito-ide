'use client';

import { useCallback } from 'react';
import { errorMessage } from '@/lib/errors';
import { submitCode } from '@/services/judge-api';
import { useIDEStore } from '@/store/ide-store';
import type { RunPayload } from '@/types/ide';

export function useSubmitAction({
  payload,
  ensureAllowedLanguage,
  setBusyAction,
  notify,
}: {
  readonly payload: RunPayload;
  readonly ensureAllowedLanguage: () => boolean;
  readonly setBusyAction: (action: 'submit' | null) => void;
  readonly notify: (message: string) => void;
}) {
  const launchToken = useIDEStore((state) => state.launchToken);
  const problem = useIDEStore((state) => state.problem);
  const contextIdentifiers = useIDEStore((state) => state.contextIdentifiers);
  const setExecution = useIDEStore((state) => state.setExecution);

  return useCallback(async () => {
    if (!ensureAllowedLanguage()) return;
    setBusyAction('submit');
    setExecution({ statusKind: undefined, phase: 'queued', verdict: 'Pending', logs: ['Envío en cola.'] });

    try {
      const response = await submitCode(
        {
          ...payload,
          problemId: problem?.problemId ?? 'local-problem',
          contestId: contextIdentifiers?.contestId,
          num: contextIdentifiers?.num,
        },
        launchToken,
      );
      setExecution({
        id: response.submissionId,
        statusKind: 'submission',
        phase: 'running',
        verdict: 'Pending',
        logs: [`Envío ${response.submissionId} aceptado por el juez.`, response.statusUrl ? `Estado: ${response.statusUrl}` : 'Esperando actualizaciones de estado.'],
      });
      notify(`Envío ${response.submissionId} creado.`);
    } catch (error) {
      setExecution({ statusKind: undefined, phase: 'error', verdict: 'Internal Error', logs: [errorMessage(error, 'Error desconocido al enviar.')] });
      notify('No se pudo enviar. Revisa la configuración del API del juez.');
    } finally {
      setBusyAction(null);
    }
  }, [contextIdentifiers?.contestId, contextIdentifiers?.num, ensureAllowedLanguage, launchToken, notify, payload, problem?.problemId, setBusyAction, setExecution]);
}
