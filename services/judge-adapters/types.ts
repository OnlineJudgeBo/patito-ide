import type { RunPayload, RunResponse, SubmissionPayload, SubmissionStatusMessage, SubmitResponse, VibeApiConfig } from '@/types/ide';

export type JudgeAdapter = {
  readonly run: (payload: RunPayload, launchToken?: string) => Promise<RunResponse>;
  readonly runStatus: (runId: string, launchToken?: string) => Promise<SubmissionStatusMessage>;
  readonly submit: (payload: SubmissionPayload, launchToken?: string) => Promise<SubmitResponse>;
  readonly submissionStatus: (submissionId: string, launchToken?: string) => Promise<SubmissionStatusMessage>;
  readonly streamUrl: (submissionId: string) => string | undefined;
};

export type JudgeAdapterFactory = (config: VibeApiConfig) => JudgeAdapter;
