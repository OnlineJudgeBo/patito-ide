'use client';

import { motion } from 'framer-motion';
import { VerdictBadge } from '@/components/VerdictBadge';
import { useIDEStore } from '@/store/ide-store';

export function ExecutionStatus() {
  const execution = useIDEStore((state) => state.execution);

  return (
    <motion.div layout className="hidden items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-400 md:flex">
      <VerdictBadge verdict={execution.verdict} />
      <span className="capitalize">{execution.phase}</span>
      <span>{execution.runtimeMs ?? '--'} ms</span>
      <span>{execution.memoryKb ? `${Math.round(execution.memoryKb / 1024)} MB` : '-- MB'}</span>
    </motion.div>
  );
}
