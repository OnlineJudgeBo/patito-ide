import { createJudgeAdapter } from '@/services/judge-adapters';
import { getRuntimeConfig } from '@/services/runtime-config';
import type { RunPayload, RunResponse, SubmissionPayload, SubmissionStatusMessage, SubmitResponse } from '@/types/ide';

async function adapter() {
  return createJudgeAdapter(await getRuntimeConfig());
}

export async function runCode(payload: RunPayload, launchToken?: string): Promise<RunResponse> {
  return (await adapter()).run(payload, launchToken);
}

export async function submitCode(payload: SubmissionPayload, launchToken?: string): Promise<SubmitResponse> {
  return (await adapter()).submit(payload, launchToken);
}

export async function getRun(runId: string, launchToken?: string): Promise<SubmissionStatusMessage> {
  return (await adapter()).runStatus(runId, launchToken);
}

export async function getSubmission(submissionId: string, launchToken?: string): Promise<SubmissionStatusMessage> {
  return (await adapter()).submissionStatus(submissionId, launchToken);
}

export async function judgeWebSocketUrl(submissionId: string) {
  return (await adapter()).streamUrl(submissionId);
}

export async function judgePollingIntervalMs() {
  const config = await getRuntimeConfig();
  return config.features?.polling === false ? 0 : Math.max(500, config.pollingIntervalMs ?? 1500);
}
