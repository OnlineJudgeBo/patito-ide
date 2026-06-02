import type { AllowedLanguageValue, ProblemExample, ProblemSection, ProblemStatement } from '@/types/ide';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function sectionContent(sections: readonly ProblemSection[] | undefined, ...names: string[]) {
  const match = sections?.find((section) => names.some((name) => section.title.toLowerCase().includes(name)));
  return match?.content ?? '';
}

function normalizeSections(value: unknown): readonly ProblemSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter(isRecord)
    .map((section) => ({
      title: stringOrEmpty(section.title),
      content: stringOrEmpty(section.content),
      format: typeof section.format === 'string' ? (section.format as ProblemSection['format']) : undefined,
    }))
    .filter((section) => section.title || section.content);
}

function normalizeSamples(value: unknown): readonly ProblemExample[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter(isRecord)
    .map((sample) => ({ input: stringOrEmpty(sample.input), output: stringOrEmpty(sample.output) }));
}

export function normalizeProblem(problem: unknown): ProblemStatement {
  if (!isRecord(problem)) throw new Error('La API de contexto no devolvió un objeto problem válido.');

  const sections = normalizeSections(problem.sections);
  const samples = normalizeSamples(problem.samples);
  const example = isRecord(problem.example) ? { input: stringOrEmpty(problem.example.input), output: stringOrEmpty(problem.example.output) } : undefined;
  const title = stringOrEmpty(problem.title);
  if (!title) throw new Error('La API de contexto no devolvió problem.title.');

  return {
    problemId: typeof problem.problemId === 'string' ? problem.problemId : problem.problemId === undefined ? undefined : String(problem.problemId),
    title,
    description: stringOrEmpty(problem.description) || sectionContent(sections, 'descripción', 'description'),
    input: stringOrEmpty(problem.input) || sectionContent(sections, 'entrada', 'input'),
    output: stringOrEmpty(problem.output) || sectionContent(sections, 'salida', 'output'),
    hints: stringOrEmpty(problem.hints) || stringOrEmpty(problem.hint) || stringOrEmpty(problem.hits) || sectionContent(sections, 'pistas', 'hints', 'hint', 'hits'),
    example: example ?? samples?.[0] ?? ({ input: '', output: '' } satisfies ProblemExample),
    sections,
    samples,
    timeLimit: stringOrEmpty(problem.timeLimit) || undefined,
    memoryLimit: stringOrEmpty(problem.memoryLimit) || undefined,
  };
}

export function normalizeAllowedLanguages(value: unknown): readonly AllowedLanguageValue[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is AllowedLanguageValue => typeof item === 'number' || typeof item === 'string');
}
