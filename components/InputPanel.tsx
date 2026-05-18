'use client';

import { useIDEStore } from '@/store/ide-store';

export function InputPanel() {
  const stdin = useIDEStore((state) => state.stdin);
  const setStdin = useIDEStore((state) => state.setStdin);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-800 bg-slate-950/80">
      <header className="flex h-10 items-center justify-between border-b border-slate-800 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        stdin
        <span className="normal-case tracking-normal text-slate-600">Persisted locally</span>
      </header>
      <textarea
        value={stdin}
        onChange={(event) => setStdin(event.target.value)}
        placeholder={'Example:\n5\n1 2 3 4 5'}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-600"
      />
    </section>
  );
}
