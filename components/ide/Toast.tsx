'use client';

import { motion } from 'framer-motion';

export function Toast({ message }: { readonly message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="fixed right-4 top-4 z-50 rounded-xl border border-sky-400/30 bg-slate-950/95 px-4 py-3 text-sm text-sky-100 shadow-glow backdrop-blur"
    >
      {message}
    </motion.div>
  );
}
