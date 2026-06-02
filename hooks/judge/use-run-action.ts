'use client';

import { useCallback } from 'react';
import { errorMessage } from '@/lib/errors';
import { runCode } from '@/services/judge-api';
import { useIDEStore } from '@/store/ide-store';
import type { RunPayload } from '@/types/ide';

export function useRunAction({
  payload,
  ensureAllowedLanguage,
  setBusyAction,
  notify,
}: {
  readonly payload: RunPayload;
  readonly ensureAllowedLanguage: () => boolean;
  readonly setBusyAction: (action: 'run' | null) => void;
  readonly notify: (message: string) => void;
}) {
  const launchToken = useIDEStore((state) => state.launchToken);
  const setExecution = useIDEStore((state) => state.setExecution);

  return useCallback(async () => {
    if (!ensureAllowedLanguage()) return;
    setBusyAction('run');
    setExecution({ statusKind: undefined, phase: 'queued', verdict: 'Pending', stdout: '', stderr: '', compileErrors: '', logs: ['Ejecución solicitada.'] });

    try {
      const response = await runCode(payload, launchToken);
      const resultIsTerminal = response.result?.phase === 'completed' || response.result?.phase === 'error';
      setExecution(
        response.result
          ? { ...response.result, statusKind: resultIsTerminal ? undefined : 'run' }
          : {
              id: response.runId,
              statusKind: 'run',
              phase: 'running',
              verdict: 'Pending',
              stdout: '',
              stderr: '',
              compileErrors: '',
              logs: ['Ejecución aceptada por el juez. Esperando actualizaciones de estado.'],
            },
      );
      notify('Ejecución enviada al juez.');
    } catch (error) {
      setExecution({ statusKind: undefined, phase: 'error', verdict: 'Internal Error', logs: [errorMessage(error, 'Error desconocido al ejecutar.')] });
      notify('No se pudo ejecutar el código. Revisa la configuración del API del juez.');
    } finally {
      setBusyAction(null);
    }
  }, [ensureAllowedLanguage, launchToken, notify, payload, setBusyAction, setExecution]);
}
