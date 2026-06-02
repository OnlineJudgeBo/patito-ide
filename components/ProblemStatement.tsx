'use client';

import { MathJaxContent } from '@/components/MathJaxContent';
import { ECHO_NUMBER_PROBLEM } from '@/lib/problem';
import { useIDEStore } from '@/store/ide-store';
import type { ProblemSection } from '@/types/ide';

function defaultSections(problem: typeof ECHO_NUMBER_PROBLEM): readonly ProblemSection[] {
  const sections: Array<ProblemSection | undefined> = [
    { title: 'Descripción', content: problem.description, format: 'html+latex' },
    { title: 'Entrada', content: problem.input, format: 'html+latex' },
    { title: 'Salida', content: problem.output, format: 'html+latex' },
    problem.hints ? { title: 'Hints', content: problem.hints, format: 'html+latex' } : undefined,
  ];
  return sections.filter((section): section is ProblemSection => Boolean(section?.content));
}

export function ProblemStatementContent({ compact = false }: { readonly compact?: boolean }) {
  const textClassName = compact ? 'space-y-3 text-xs leading-5' : 'space-y-4 text-sm leading-6';
  const problem = useIDEStore((state) => state.problem) ?? ECHO_NUMBER_PROBLEM;
  const baseSections = problem.sections?.length ? problem.sections : defaultSections(problem);
  const hasHintsSection = baseSections.some((section) => ['hint', 'hints', 'pista', 'pistas'].some((name) => section.title.toLowerCase().includes(name)));
  const sections = problem.hints && !hasHintsSection ? [...baseSections, { title: 'Hints', content: problem.hints, format: 'html+latex' } satisfies ProblemSection] : baseSections;
  const samples = problem.samples?.length ? problem.samples : [problem.example];

  return (
    <div className={`${textClassName} text-slate-300`}>
      {sections.map((section) => (
        <section key={`${section.title}-${section.content.slice(0, 12)}`}>
          <h4 className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-slate-100">{section.title}</h4>
          <MathJaxContent value={section.content} as="div" />
        </section>
      ))}
      <section className={`grid gap-3 ${compact ? '' : 'md:grid-cols-2'}`}>
        {samples.map((sample, index) => (
          <div key={`sample-${index}`} className={`grid gap-3 ${compact ? '' : 'md:col-span-2 md:grid-cols-2'}`}>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <h4 className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-100">Ejemplo de Entrada {samples.length > 1 ? index + 1 : ''}</h4>
              <MathJaxContent value={sample.input} as="pre" className="font-mono text-sky-100" />
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <h4 className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-100">Ejemplo de Salida {samples.length > 1 ? index + 1 : ''}</h4>
              <MathJaxContent value={sample.output} as="pre" className="font-mono text-emerald-100" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
