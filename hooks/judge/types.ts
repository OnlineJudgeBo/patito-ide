export type BusyAction = 'run' | 'submit' | null;

export type JudgeActionOptions = {
  readonly notify: (message: string) => void;
};
