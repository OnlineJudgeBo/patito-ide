import type { ProblemExample, ProblemStatement, Testcase } from '@/types/ide';

function testcaseFromExample(example: ProblemExample, index: number): Testcase {
  return {
    id: `sample-${index + 1}`,
    name: `Caso de ejemplo ${index + 1}`,
    input: example.input,
    expectedOutput: example.output,
    actualOutput: '',
    status: 'idle',
    expanded: index === 0,
  };
}

export function testcasesFromProblem(problem: ProblemStatement): readonly Testcase[] {
  const samples = problem.samples?.length ? problem.samples : problem.example.input || problem.example.output ? [problem.example] : [];
  return samples.map(testcaseFromExample);
}
