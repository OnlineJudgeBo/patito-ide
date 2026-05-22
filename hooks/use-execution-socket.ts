'use client';

import { useEffect, useRef } from 'react';
import { errorMessage } from '@/lib/errors';
import { parseSubmissionStatusMessage } from '@/lib/execution-message';
import { judgeWebSocketUrl } from '@/services/judge-api';
import { useIDEStore } from '@/store/ide-store';

export function useExecutionSocket(submissionId?: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const setExecution = useIDEStore((state) => state.setExecution);
  const addLog = useIDEStore((state) => state.addLog);

  useEffect(() => {
    if (!submissionId) return undefined;

    let socket: WebSocket;
    try {
      socket = new WebSocket(judgeWebSocketUrl(submissionId));
    } catch (error) {
      addLog(errorMessage(error, 'Could not create judge WebSocket connection.'));
      return undefined;
    }

    socketRef.current = socket;

    socket.addEventListener('open', () => addLog(`WebSocket connected for submission ${submissionId}.`));
    socket.addEventListener('message', (event) => {
      const parsedData = safeParseJson(event.data);
      const message = parseSubmissionStatusMessage(parsedData);

      if (!message) {
        addLog('Received an invalid judge WebSocket message. Ignoring it.');
        return;
      }

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
    socket.addEventListener('error', () => addLog('WebSocket error. HTTP polling is not available in this client yet.'));
    socket.addEventListener('close', () => addLog('WebSocket connection closed.'));

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [addLog, setExecution, submissionId]);

  return socketRef;
}

function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}
