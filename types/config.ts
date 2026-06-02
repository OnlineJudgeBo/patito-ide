export type JudgeFeatures = {
  readonly run?: boolean;
  readonly submit?: boolean;
  readonly websocket?: boolean;
  readonly polling?: boolean;
  readonly lsp?: boolean;
};

export type VibeApiConfig = {
  readonly adapter?: 'vibe' | 'mock';
  readonly apiBaseUrl?: string;
  readonly wsBaseUrl?: string;
  readonly contextUrl?: string;
  readonly paths?: {
    readonly context?: string;
    readonly run?: string;
    readonly runStatus?: string;
    readonly submit?: string;
    readonly submissionStatus?: string;
    readonly submissionStream?: string;
  };
  readonly features?: JudgeFeatures;
  readonly mathJax?: {
    readonly enabled?: boolean;
    readonly src?: string;
  };
  readonly pollingIntervalMs?: number;
};
