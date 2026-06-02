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
