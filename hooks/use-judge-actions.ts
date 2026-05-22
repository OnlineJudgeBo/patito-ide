'use client';

import { useCallback, useMemo, useState } from 'react';
import { errorMessage } from '@/lib/errors';
import { getLanguage } from '@/lib/language-options';
import { downloadTextFile } from '@/services/download-file';
import { runCode, submitCode } from '@/services/judge-api';
import { useIDEStore } from '@/store/ide-store';
import type { ExecutionResult } from '@/types/ide';

type BusyAction = 'run' | 'submit' | null;

type JudgeActionOptions = {
  readonly notify: (message: string) => void;
};

export function useJudgeActions({ notify }: JudgeActionOptions) {
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const codeByLanguage = useIDEStore((state) => state.codeByLanguage);
  const stdin = useIDEStore((state) => state.stdin);
  const testcases = useIDEStore((state) => state.testcases);
  const setExecution = useIDEStore((state) => state.setExecution);
  const addLog = useIDEStore((state) => state.addLog);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);

  const payload = useMemo(
    () => ({ sourceCode: codeByLanguage[selectedLanguage], language: selectedLanguage, stdin, testcases }),
    [codeByLanguage, selectedLanguage, stdin, testcases],
  );

  const run = useCallback(async () => {
    setBusyAction('run');
    setExecution({ phase: 'queued', verdict: 'Pending', stdout: '', stderr: '', compileErrors: '', logs: ['Run requested.'] });

    try {
      const response = await runCode(payload);
      const result: ExecutionResult = response.result ?? {
        id: response.runId,
        phase: 'running',
        verdict: 'Pending',
        stdout: '',
        stderr: '',
        compileErrors: '',
        logs: ['Run accepted by judge backend. Waiting for WebSocket status updates.'],
      };

      setExecution(result);
      notify('Run sent to judge backend.');
    } catch (error) {
      setExecution({ phase: 'error', verdict: 'Internal Error', logs: [errorMessage(error, 'Unknown run error')] });
      notify('Could not run code. Check judge API settings.');
    } finally {
      setBusyAction(null);
    }
  }, [notify, payload, setExecution]);

  const submit = useCallback(async () => {
    setBusyAction('submit');
    setExecution({ phase: 'queued', verdict: 'Pending', logs: ['Submission queued.'] });

    try {
      const response = await submitCode({ ...payload, problemId: 'local-problem' });
      setExecution({
        id: response.submissionId,
        phase: 'running',
        verdict: 'Pending',
        logs: ['Submission accepted. WebSocket status stream is ready.'],
      });
      notify(`Submission ${response.submissionId} created.`);
    } catch (error) {
      setExecution({ phase: 'error', verdict: 'Internal Error', logs: [errorMessage(error, 'Unknown submission error')] });
      notify('Could not submit. Check judge API settings.');
    } finally {
      setBusyAction(null);
    }
  }, [notify, payload, setExecution]);

  const save = useCallback(() => {
    addLog('Workspace saved locally.');
    notify('Saved locally.');
  }, [addLog, notify]);

  const download = useCallback(() => {
    const language = getLanguage(selectedLanguage);
    const fileName = `main.${language.extension}`;

    downloadTextFile(fileName, codeByLanguage[selectedLanguage]);
    notify(`Código descargado como ${fileName}.`);
  }, [codeByLanguage, notify, selectedLanguage]);

  return { busyAction, run, submit, save, download } as const;
}
