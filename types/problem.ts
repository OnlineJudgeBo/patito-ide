export type ProblemExample = {
  readonly input: string;
  readonly output: string;
};

export type ProblemSection = {
  readonly title: string;
  readonly content: string;
  readonly format?: 'text' | 'markdown' | 'html' | 'latex' | 'html+latex' | 'markdown+latex';
};

export type ProblemStatement = {
  readonly problemId?: string;
  readonly title: string;
  readonly description: string;
  readonly input: string;
  readonly output: string;
  readonly hints?: string;
  readonly example: ProblemExample;
  readonly sections?: readonly ProblemSection[];
  readonly samples?: readonly ProblemExample[];
  readonly timeLimit?: string;
  readonly memoryLimit?: string;
};
