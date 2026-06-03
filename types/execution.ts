import type { LanguageId } from '@/types/language';
import type { Testcase } from '@/types/testcase';

export type ExecutionPhase = 'idle' | 'queued' | 'running' | 'completed' | 'error';

export type Verdict =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Compilation Error'
  | 'Runtime Error'
  | 'Time Limit Exceeded'
  | 'Pending'
  | 'Internal Error';

export type ExecutionResult = {
  readonly id?: string;
  readonly statusKind?: 'run' | 'submission';
  readonly phase: ExecutionPhase;
  readonly verdict: Verdict;
  readonly stdout: string;
  readonly stderr: string;
  readonly compileErrors: string;
  readonly logs: readonly string[];
  readonly runtimeMs?: number;
  readonly memoryKb?: number;
};

export type RunPayload = {
  readonly sourceCode: string;
  readonly language: LanguageId;
  readonly languageId?: number;
  readonly stdin: string;
  readonly testcases?: readonly Testcase[];
};

export type RunResponse = {
  readonly runId: string;
  readonly result?: ExecutionResult;
  readonly statusUrl?: string;
  readonly streamUrl?: string;
};

export type SubmissionPayload = RunPayload & {
  readonly problemId?: string;
  readonly contestId?: number | string;
  readonly num?: number;
};

export type SubmitResponse = {
  readonly submissionId: string;
  readonly statusUrl?: string;
  readonly streamUrl?: string;
};

export type SubmissionStatusMessage = {
  readonly submissionId: string;
  readonly phase: ExecutionPhase;
  readonly verdict?: Verdict;
  readonly stdout?: string;
  readonly stderr?: string;
  readonly compileErrors?: string;
  readonly logs?: readonly string[];
  readonly runtimeMs?: number;
  readonly memoryKb?: number;
};
