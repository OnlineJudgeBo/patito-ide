import type { JudgeAdapterFactory } from '@/services/judge-adapters/types';
import type { RunPayload, RunResponse, SubmissionPayload, SubmissionStatusMessage, SubmitResponse } from '@/types/ide';

function mockRun(payload: RunPayload): RunResponse {
  const id = `run-${Date.now()}`;
  return {
    runId: id,
    result: {
      id,
      phase: 'completed',
      verdict: 'Accepted',
      stdout: payload.stdin,
      stderr: '',
      compileErrors: '',
      logs: ['Ejecución mock completada.'],
      runtimeMs: 1,
      memoryKb: 1024,
    },
  };
}

function mockSubmit(_payload: SubmissionPayload): SubmitResponse {
  return { submissionId: `sub-${Date.now()}` };
}

function mockStatus(submissionId: string): SubmissionStatusMessage {
  return { submissionId, phase: 'completed', verdict: 'Accepted', logs: ['Envío mock aceptado.'] };
}

export const createMockAdapter: JudgeAdapterFactory = () => ({
  run: async (payload) => mockRun(payload),
  runStatus: async (runId) => mockStatus(runId),
  submit: async (payload) => mockSubmit(payload),
  submissionStatus: async (submissionId) => mockStatus(submissionId),
  streamUrl: () => undefined,
});
