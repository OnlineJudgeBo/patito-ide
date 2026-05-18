import type { ExecutionResult, RunPayload, SubmissionPayload, SubmissionStatusMessage } from '@/types/ide';

const API_BASE_URL = process.env.NEXT_PUBLIC_JUDGE_API_URL ?? 'https://judge.example.com';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Judge API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function runCode(payload: RunPayload): Promise<{ runId: string; result?: ExecutionResult }> {
  return request('/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitCode(payload: SubmissionPayload): Promise<{ submissionId: string }> {
  return request('/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getSubmission(submissionId: string): Promise<SubmissionStatusMessage> {
  return request(`/submission/${submissionId}`);
}

export function judgeWebSocketUrl(submissionId: string) {
  const configured = process.env.NEXT_PUBLIC_JUDGE_WS_URL;
  if (configured) return `${configured.replace(/\/$/, '')}/submission/${submissionId}`;

  const httpUrl = new URL(API_BASE_URL);
  httpUrl.protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${httpUrl.toString().replace(/\/$/, '')}/submission/${submissionId}`;
}
