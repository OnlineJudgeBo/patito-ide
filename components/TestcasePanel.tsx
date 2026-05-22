'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useIDEStore } from '@/store/ide-store';
import type { TestcaseStatus } from '@/types/ide';

const statusStyles: Record<TestcaseStatus, string> = {
  idle: 'bg-slate-700 text-slate-200',
  running: 'bg-sky-500/20 text-sky-200',
  passed: 'bg-emerald-500/20 text-emerald-200',
  failed: 'bg-rose-500/20 text-rose-200',
  error: 'bg-amber-500/20 text-amber-200',
};

export function TestcasePanel() {
  const testcases = useIDEStore((state) => state.testcases);
  const updateTestcase = useIDEStore((state) => state.updateTestcase);
  const addTestcase = useIDEStore((state) => state.addTestcase);
  const removeTestcase = useIDEStore((state) => state.removeTestcase);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-800 bg-slate-950/80">
      <header className="flex h-10 items-center justify-between border-b border-slate-800 px-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Testcases</span>
        <button onClick={addTestcase} className="rounded-lg border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-300 hover:border-sky-400 hover:text-sky-200">
          + Add
        </button>
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
        {testcases.map((testcase) => (
          <motion.article key={testcase.id} layout className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
            <button
              onClick={() => updateTestcase(testcase.id, { expanded: !testcase.expanded })}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
            >
              <span className="font-semibold text-slate-200">{testcase.name}</span>
              <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusStyles[testcase.status]}`}>{testcase.status}</span>
            </button>
            <AnimatePresence initial={false}>
              {testcase.expanded ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-800">
                  <div className="grid gap-2 p-3 lg:grid-cols-3">
                    <label className="grid gap-1 text-xs font-semibold text-slate-500">
                      Input
                      <textarea value={testcase.input} onChange={(event) => updateTestcase(testcase.id, { input: event.target.value })} className="h-24 resize-none rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-xs text-slate-200 outline-none focus:border-sky-400" />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-slate-500">
                      Expected output
                      <textarea value={testcase.expectedOutput} onChange={(event) => updateTestcase(testcase.id, { expectedOutput: event.target.value })} className="h-24 resize-none rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-xs text-slate-200 outline-none focus:border-sky-400" />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-slate-500">
                      Actual output
                      <textarea value={testcase.actualOutput ?? ''} onChange={(event) => updateTestcase(testcase.id, { actualOutput: event.target.value })} className="h-24 resize-none rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-xs text-slate-200 outline-none focus:border-sky-400" />
                    </label>
                  </div>
                  <div className="flex justify-end border-t border-slate-800 px-3 py-2">
                    <button onClick={() => removeTestcase(testcase.id)} className="text-xs font-semibold text-rose-300 hover:text-rose-200">Remove</button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
