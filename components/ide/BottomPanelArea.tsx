'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { InputPanel } from '@/components/InputPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { TestcasePanel } from '@/components/TestcasePanel';
import { BOTTOM_PANELS } from '@/lib/ui-config';
import type { BottomPanel } from '@/types/ide';

const PANEL_LABELS: Record<BottomPanel, string> = {
  output: 'Resultado',
  input: 'Entrada personalizada',
  testcases: 'Casos de prueba',
};

type BottomPanelAreaProps = {
  readonly activePanel: BottomPanel;
  readonly height: number;
  readonly onPanelChange: (panel: BottomPanel) => void;
};

export function BottomPanelArea({ activePanel, height, onPanelChange }: BottomPanelAreaProps) {
  return (
    <section style={{ height }} className="min-h-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-panel">
      <div className="mb-2 flex gap-2">
        {BOTTOM_PANELS.map((panel) => (
          <button
            key={panel}
            onClick={() => onPanelChange(panel)}
            className={`rounded-xl px-3 py-2 text-sm font-bold capitalize transition ${activePanel === panel ? 'bg-sky-400 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-slate-200'}`}
          >
            {PANEL_LABELS[panel]}
          </button>
        ))}
      </div>
      <div className="h-[calc(100%-48px)] min-h-0">
        <AnimatePresence mode="wait">
          <motion.div key={activePanel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="h-full">
            {activePanel === 'output' ? <OutputPanel /> : null}
            {activePanel === 'input' ? <InputPanel /> : null}
            {activePanel === 'testcases' ? <TestcasePanel /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
