'use client';

import { useEffect, useRef } from 'react';
import { errorMessage } from '@/lib/errors';
import { parseSubmissionStatusMessage } from '@/lib/execution-message';
import { getRun, getSubmission, judgePollingIntervalMs, judgeWebSocketUrl } from '@/services/judge-api';
import { useIDEStore } from '@/store/ide-store';

const TERMINAL_PHASES = new Set(['completed', 'error']);

export function useExecutionSocket(executionId?: string, launchToken?: string, statusKind?: 'run' | 'submission') {
  const socketRef = useRef<WebSocket | null>(null);
  const setExecution = useIDEStore((state) => state.setExecution);
  const addLog = useIDEStore((state) => state.addLog);

  useEffect(() => {
    if (!executionId || !statusKind) return undefined;
    const activeExecutionId = executionId;

    let cancelled = false;
    let pollTimer: number | undefined;
    let socket: WebSocket | undefined;

    function applyStatus(message: ReturnType<typeof parseSubmissionStatusMessage>) {
      if (!message) return false;
      setExecution({
        id: message.submissionId,
        statusKind,
        phase: message.phase,
        verdict: message.verdict ?? 'Pending',
        stdout: message.stdout ?? '',
        stderr: message.stderr ?? '',
        compileErrors: message.compileErrors ?? '',
        logs: message.logs ?? [],
        runtimeMs: message.runtimeMs,
        memoryKb: message.memoryKb,
      });
      return TERMINAL_PHASES.has(message.phase);
    }

    async function poll(intervalMs: number) {
      if (cancelled) return;
      try {
        const message = statusKind === 'run' ? await getRun(activeExecutionId, launchToken) : await getSubmission(activeExecutionId, launchToken);
        const terminal = applyStatus(message);
        if (!terminal && !cancelled) {
          pollTimer = window.setTimeout(() => void poll(intervalMs), intervalMs);
        }
      } catch (error) {
        addLog(errorMessage(error, 'HTTP polling failed.'));
        if (!cancelled) pollTimer = window.setTimeout(() => void poll(intervalMs), intervalMs);
      }
    }

    async function start() {
      const [url, pollingInterval] = await Promise.all([statusKind === 'submission' ? judgeWebSocketUrl(activeExecutionId) : undefined, judgePollingIntervalMs()]);
      if (cancelled) return;

      if (!url) {
        if (pollingInterval > 0) {
          addLog(`Consultando estado de ${statusKind === 'run' ? 'ejecución' : 'envío'} ${activeExecutionId}.`);
          void poll(pollingInterval);
        } else {
          addLog('No hay transporte de estado configurado.');
        }
        return;
      }

      try {
        socket = new WebSocket(url);
      } catch (error) {
        addLog(errorMessage(error, 'No se pudo crear la conexión WebSocket del juez.'));
        if (pollingInterval > 0) void poll(pollingInterval);
        return;
      }

      socketRef.current = socket;
      socket.addEventListener('open', () => addLog(`WebSocket conectado para envío ${activeExecutionId}.`));
      socket.addEventListener('message', (event) => {
        const parsedData = safeParseJson(event.data);
        const message = parseSubmissionStatusMessage(parsedData);

        if (!message) {
          addLog('El juez envió un mensaje WebSocket inválido.');
          return;
        }

        applyStatus(message);
      });
      socket.addEventListener('error', () => {
        addLog('Error de WebSocket. Usando polling HTTP si está disponible.');
        if (pollingInterval > 0 && !pollTimer) void poll(pollingInterval);
      });
      socket.addEventListener('close', () => addLog('Conexión WebSocket cerrada.'));
    }

    void start();

    return () => {
      cancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
      socket?.close();
      socketRef.current = null;
    };
  }, [addLog, executionId, launchToken, setExecution, statusKind]);

  return socketRef;
}

function safeParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}
