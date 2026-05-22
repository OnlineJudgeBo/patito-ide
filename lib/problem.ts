export type ProblemExample = {
  readonly input: string;
  readonly output: string;
};

export type ProblemStatement = {
  readonly title: string;
  readonly description: string;
  readonly input: string;
  readonly output: string;
  readonly constraints: string;
  readonly example: ProblemExample;
};

export const ECHO_NUMBER_PROBLEM: ProblemStatement = {
  title: 'Echo Number',
  description:
    'Lee un entero e imprime exactamente el mismo entero. Este problema de ejemplo mantiene simple el flujo del juez mientras pruebas el editor, la entrada personalizada y los envíos.',
  input: 'Un solo entero n.',
  output: 'Imprime el valor de n.',
  constraints: '1 <= n <= 10^9',
  example: {
    input: '5',
    output: '5',
  },
};
