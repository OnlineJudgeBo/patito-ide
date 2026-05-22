import { requestJson } from '@/services/http-client';
import type { ExecutionResult, RunPayload, SubmissionPayload, SubmissionStatusMessage } from '@/types/ide';

const API_BASE_URL = process.env.NEXT_PUBLIC_JUDGE_API_URL;

type RunResponse = {
  readonly runId: string;
  readonly result?: ExecutionResult;
};

type SubmitResponse = {
  readonly submissionId: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

function endpoint(path: string) {
  return `${trimTrailingSlash(API_BASE_URL)}${path}`;
}

export async function runCode(payload: RunPayload): Promise<RunResponse> {
  return requestJson(endpoint('/run'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitCode(payload: SubmissionPayload): Promise<SubmitResponse> {
  return requestJson(endpoint('/submit'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getSubmission(submissionId: string): Promise<SubmissionStatusMessage> {
  return requestJson(endpoint(`/submission/${submissionId}`));
}

export function judgeWebSocketUrl(submissionId: string) {
  const configured = process.env.NEXT_PUBLIC_JUDGE_WS_URL;
  if (configured) return `${trimTrailingSlash(configured)}/submission/${submissionId}`;

  let httpUrl: URL;
  try {
    httpUrl = new URL(API_BASE_URL);
  } catch {
    throw new Error('NEXT_PUBLIC_JUDGE_API_URL must be an absolute http(s) URL when NEXT_PUBLIC_JUDGE_WS_URL is not set.');
  }

  httpUrl.protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${trimTrailingSlash(httpUrl.toString())}/submission/${submissionId}`;
}
