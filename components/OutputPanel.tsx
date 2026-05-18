'use client';

import { motion } from 'framer-motion';
import { VerdictBadge } from '@/components/VerdictBadge';
import { useIDEStore } from '@/store/ide-store';

function OutputBlock({ title, value, tone = 'slate' }: { title: string; value: string; tone?: 'slate' | 'red' | 'amber' | 'sky' }) {
  const toneClass = {
    slate: 'text-slate-300',
    red: 'text-red-300',
    amber: 'text-amber-300',
    sky: 'text-sky-300',
  }[tone];

  return (
    <div className="min-h-0 rounded-xl border border-slate-800 bg-slate-950/70">
      <div className="border-b border-slate-800 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</div>
      <pre className={`max-h-36 overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-5 ${toneClass}`}>{value || '(empty)'}</pre>
    </div>
  );
}

export function OutputPanel() {
  const execution = useIDEStore((state) => state.execution);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-800 bg-slate-950/80">
      <header className="flex h-10 items-center justify-between border-b border-slate-800 px-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Output</span>
        <VerdictBadge verdict={execution.verdict} />
      </header>
      <motion.div layout className="grid min-h-0 flex-1 gap-3 overflow-auto p-3 md:grid-cols-2">
        <OutputBlock title="stdout" value={execution.stdout} tone="sky" />
        <OutputBlock title="stderr" value={execution.stderr} tone="red" />
        <OutputBlock title="compile errors" value={execution.compileErrors} tone="amber" />
        <OutputBlock title="logs" value={execution.logs.join('\n')} />
      </motion.div>
    </section>
  );
}
