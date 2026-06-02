'use client';

import { motion } from 'framer-motion';

export function SubmitButton({ submitting, disabled = false, onSubmit }: { submitting: boolean; disabled?: boolean; onSubmit: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSubmit}
      disabled={submitting || disabled}
      className="h-9 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting ? 'Enviando…' : 'Enviar'}
    </motion.button>
  );
}
