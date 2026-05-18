export type LanguageId = 'cpp' | 'python' | 'java' | 'javascript' | 'rust' | 'go';

export type ExecutionPhase = 'idle' | 'queued' | 'running' | 'completed' | 'error';

export type Verdict =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Compilation Error'
  | 'Runtime Error'
  | 'Time Limit Exceeded'
  | 'Pending'
  | 'Internal Error';

export type LanguageDefinition = {
  id: LanguageId;
  label: string;
  monacoLanguage: string;
  judgeLanguage: string;
  extension: string;
  defaultCode: string;
};

export type ExecutionResult = {
  id?: string;
  phase: ExecutionPhase;
  verdict: Verdict;
  stdout: string;
  stderr: string;
  compileErrors: string;
  logs: string[];
  runtimeMs?: number;
  memoryKb?: number;
};

export type TestcaseStatus = 'idle' | 'running' | 'passed' | 'failed' | 'error';

export type Testcase = {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  status: TestcaseStatus;
  expanded: boolean;
};

export type RunPayload = {
  sourceCode: string;
  language: LanguageId;
  stdin: string;
  testcases?: Testcase[];
};

export type SubmissionPayload = RunPayload & {
  problemId?: string;
};

export type SubmissionStatusMessage = {
  submissionId: string;
  phase: ExecutionPhase;
  verdict?: Verdict;
  stdout?: string;
  stderr?: string;
  compileErrors?: string;
  logs?: string[];
  runtimeMs?: number;
  memoryKb?: number;
};
