import { ECHO_NUMBER_PROBLEM } from '@/lib/problem';

export function ProblemStatementContent({ compact = false }: { readonly compact?: boolean }) {
  const textClassName = compact ? 'space-y-3 text-xs leading-5' : 'space-y-4 text-sm leading-6';

  return (
    <div className={`${textClassName} text-slate-300`}>
      <section>
        <h4 className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-slate-100">Descripción</h4>
        <p>{ECHO_NUMBER_PROBLEM.description}</p>
      </section>
      <section>
        <h4 className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-slate-100">Entrada</h4>
        <p>
          Un solo entero <span className="font-mono text-sky-200">n</span>.
        </p>
      </section>
      <section>
        <h4 className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-slate-100">Salida</h4>
        <p>
          Imprime el valor de <span className="font-mono text-sky-200">n</span>.
        </p>
      </section>
      <section>
        <h4 className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-slate-100">Restricciones</h4>
        <p className="font-mono text-amber-200">{ECHO_NUMBER_PROBLEM.constraints}</p>
      </section>
      <section className={`grid gap-3 ${compact ? '' : 'md:grid-cols-2'}`}>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <h4 className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-100">Ejemplo de Entrada</h4>
          <pre className="font-mono text-sky-100">{ECHO_NUMBER_PROBLEM.example.input}</pre>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <h4 className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-100">Ejemplo de Salida</h4>
          <pre className="font-mono text-emerald-100">{ECHO_NUMBER_PROBLEM.example.output}</pre>
        </div>
      </section>
    </div>
  );
}
