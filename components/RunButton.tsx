'use client';

import { motion } from 'framer-motion';

export function RunButton({ running, disabled = false, onRun }: { running: boolean; disabled?: boolean; onRun: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onRun}
      disabled={running || disabled}
      className="h-9 rounded-lg bg-sky-500 px-4 text-sm font-bold text-slate-950 shadow-glow transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {running ? 'Ejecutando…' : 'Ejecutar'}
    </motion.button>
  );
}
