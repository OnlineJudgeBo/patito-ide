'use client';

import { ExecutionStatus } from '@/components/ExecutionStatus';
import { LanguageSelector } from '@/components/LanguageSelector';
import { RunButton } from '@/components/RunButton';
import { SubmitButton } from '@/components/SubmitButton';
import type { ContextLoadState, JudgeFeatures } from '@/types/ide';

type WorkspaceHeaderProps = {
  readonly fileExtension: string;
  readonly busyAction: 'run' | 'submit' | null;
  readonly contextStatus: ContextLoadState;
  readonly judgeFeatures: JudgeFeatures;
  readonly onDownload: () => void;
  readonly onReset: () => void;
  readonly onRun: () => void;
  readonly onSubmit: () => void;
  readonly onToggleSidebar: () => void;
};

export function WorkspaceHeader({
  fileExtension,
  busyAction,
  contextStatus,
  judgeFeatures,
  onDownload,
  onReset,
  onRun,
  onSubmit,
  onToggleSidebar,
}: WorkspaceHeaderProps) {
  const loadingContext = contextStatus === 'loading';
  return (
    <header className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-2 py-2 shadow-panel backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <button onClick={onToggleSidebar} className="h-9 rounded-lg border border-slate-800 px-3 text-sm font-bold text-slate-300 hover:border-sky-400 hover:text-sky-200">
          ☰
        </button>
        <h2 className="text-base font-black text-white">main.{fileExtension}</h2>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <LanguageSelector />
        <button onClick={onDownload} className="h-9 rounded-lg border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:border-sky-400 hover:text-sky-200">
          Descargar
        </button>
        <button onClick={onReset} className="h-9 rounded-lg border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:border-amber-400 hover:text-amber-200">
          Reset
        </button>
        <ExecutionStatus />
        {judgeFeatures.run !== false ? <RunButton running={busyAction === 'run'} disabled={loadingContext} onRun={onRun} /> : null}
        {judgeFeatures.submit !== false ? <SubmitButton submitting={busyAction === 'submit'} disabled={loadingContext} onSubmit={onSubmit} /> : null}
      </div>
    </header>
  );
}
