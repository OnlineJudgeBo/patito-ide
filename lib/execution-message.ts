import type { ExecutionPhase, SubmissionStatusMessage, Verdict } from '@/types/ide';

const executionPhases = ['idle', 'queued', 'running', 'completed', 'error'] as const satisfies readonly ExecutionPhase[];
const verdicts = [
  'Accepted',
  'Wrong Answer',
  'Compilation Error',
  'Runtime Error',
  'Time Limit Exceeded',
  'Pending',
  'Internal Error',
] as const satisfies readonly Verdict[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isExecutionPhase(value: unknown): value is ExecutionPhase {
  return typeof value === 'string' && executionPhases.some((phase) => phase === value);
}

function isVerdict(value: unknown): value is Verdict {
  return typeof value === 'string' && verdicts.some((verdict) => verdict === value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function optionalStringArray(value: unknown): readonly string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : undefined;
}

export function parseSubmissionStatusMessage(value: unknown): SubmissionStatusMessage | undefined {
  if (!isRecord(value) || typeof value.submissionId !== 'string' || !isExecutionPhase(value.phase)) return undefined;

  return {
    submissionId: value.submissionId,
    phase: value.phase,
    verdict: isVerdict(value.verdict) ? value.verdict : undefined,
    stdout: optionalString(value.stdout),
    stderr: optionalString(value.stderr),
    compileErrors: optionalString(value.compileErrors),
    logs: optionalStringArray(value.logs),
    runtimeMs: optionalNumber(value.runtimeMs),
    memoryKb: optionalNumber(value.memoryKb),
  };
}
