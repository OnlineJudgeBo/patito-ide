'use client';

import { useEffect, useRef } from 'react';
import { judgeWebSocketUrl } from '@/services/judge-api';
import { useIDEStore } from '@/store/ide-store';
import type { SubmissionStatusMessage } from '@/types/ide';

export function useExecutionSocket(submissionId?: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const setExecution = useIDEStore((state) => state.setExecution);
  const addLog = useIDEStore((state) => state.addLog);

  useEffect(() => {
    if (!submissionId) return undefined;

    const socket = new WebSocket(judgeWebSocketUrl(submissionId));
    socketRef.current = socket;

    socket.addEventListener('open', () => addLog(`WebSocket connected for submission ${submissionId}.`));
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data) as SubmissionStatusMessage;
      setExecution({
        id: message.submissionId,
        phase: message.phase,
        verdict: message.verdict ?? 'Pending',
        stdout: message.stdout ?? '',
        stderr: message.stderr ?? '',
        compileErrors: message.compileErrors ?? '',
        logs: message.logs ?? [],
        runtimeMs: message.runtimeMs,
        memoryKb: message.memoryKb,
      });
    });
    socket.addEventListener('error', () => addLog('WebSocket error. Falling back to HTTP polling is recommended by your judge backend.'));
    socket.addEventListener('close', () => addLog('WebSocket connection closed.'));

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [addLog, setExecution, submissionId]);

  return socketRef;
}
