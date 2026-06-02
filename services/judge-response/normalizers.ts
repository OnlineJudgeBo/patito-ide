import { parseSubmissionStatusMessage } from '@/lib/execution-message';
import type { RunResponse, SubmissionStatusMessage, SubmitResponse } from '@/types/ide';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value === 'string' && value.trim()) return value;
  throw new Error(`La respuesta del juez no incluye ${field}.`);
}

export function normalizeRunResponse(value: unknown): RunResponse {
  if (!isRecord(value)) throw new Error('La respuesta de ejecución del juez no es un objeto válido.');
  return {
    runId: requiredString(value.runId ?? value.id, 'runId'),
    result: isRecord(value.result) ? (value.result as RunResponse['result']) : undefined,
    statusUrl: optionalString(value.statusUrl),
    streamUrl: optionalString(value.streamUrl),
  };
}

export function normalizeSubmitResponse(value: unknown): SubmitResponse {
  if (!isRecord(value)) throw new Error('La respuesta de envío del juez no es un objeto válido.');
  return {
    submissionId: requiredString(value.submissionId ?? value.id, 'submissionId'),
    statusUrl: optionalString(value.statusUrl),
    streamUrl: optionalString(value.streamUrl),
  };
}

export function normalizeStatusResponse(id: string, value: unknown): SubmissionStatusMessage {
  const direct = parseSubmissionStatusMessage(value, id);
  if (direct) return direct;

  if (isRecord(value) && 'result' in value) {
    const nested = parseSubmissionStatusMessage({ submissionId: id, ...(value.result as object) }, id);
    if (nested) return nested;
  }

  return { submissionId: id, phase: 'running', verdict: 'Pending', logs: ['La respuesta de estado del juez no coincide con el formato Vibe.'] };
}
