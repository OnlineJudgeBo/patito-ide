import type { ProblemStatement } from '@/types/ide';

export const ECHO_NUMBER_PROBLEM: ProblemStatement = {
  title: 'Echo Number',
  description:
    'Lee un entero e imprime exactamente el mismo entero. Este problema de ejemplo mantiene simple el flujo del juez mientras pruebas el editor, la entrada personalizada y los envíos.',
  input: 'Un solo entero n.',
  output: 'Imprime el valor de n.',
  example: {
    input: '5',
    output: '5',
  },
};
