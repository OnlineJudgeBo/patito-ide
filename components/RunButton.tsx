'use client';

import { motion } from 'framer-motion';

export function RunButton({ running, onRun }: { running: boolean; onRun: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onRun}
      disabled={running}
      className="h-10 rounded-xl bg-sky-500 px-4 text-sm font-bold text-slate-950 shadow-glow transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {running ? 'Running…' : 'Run'}
    </motion.button>
  );
}
