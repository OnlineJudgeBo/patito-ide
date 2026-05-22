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

export type ColorTheme = 'dark' | 'light' | 'hacker';
export type BottomPanel = 'output' | 'input' | 'testcases';

export type LanguageDefinition = {
  readonly id: LanguageId;
  readonly label: string;
  readonly monacoLanguage: string;
  readonly judgeLanguage: string;
  readonly extension: string;
  readonly defaultCode: string;
};

export type ExecutionResult = {
  readonly id?: string;
  readonly phase: ExecutionPhase;
  readonly verdict: Verdict;
  readonly stdout: string;
  readonly stderr: string;
  readonly compileErrors: string;
  readonly logs: readonly string[];
  readonly runtimeMs?: number;
  readonly memoryKb?: number;
};

export type TestcaseStatus = 'idle' | 'running' | 'passed' | 'failed' | 'error';

export type Testcase = {
  readonly id: string;
  readonly name: string;
  readonly input: string;
  readonly expectedOutput: string;
  readonly actualOutput?: string;
  readonly status: TestcaseStatus;
  readonly expanded: boolean;
};

export type UISettings = {
  readonly bottomPanelHeight: number;
  readonly colorTheme: ColorTheme;
  readonly minimap: boolean;
  readonly sidebarWidth: number;
  readonly sidebarCollapsed: boolean;
};

export type RunPayload = {
  readonly sourceCode: string;
  readonly language: LanguageId;
  readonly stdin: string;
  readonly testcases?: readonly Testcase[];
};

export type SubmissionPayload = RunPayload & {
  readonly problemId?: string;
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
