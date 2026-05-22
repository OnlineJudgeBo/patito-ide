'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CodeEditor } from '@/components/CodeEditor';
import { ExecutionStatus } from '@/components/ExecutionStatus';
import { InputPanel } from '@/components/InputPanel';
import { LanguageSelector } from '@/components/LanguageSelector';
import { OutputPanel } from '@/components/OutputPanel';
import { ProblemStatementContent } from '@/components/ProblemStatement';
import { RunButton } from '@/components/RunButton';
import { SubmitButton } from '@/components/SubmitButton';
import { TestcasePanel } from '@/components/TestcasePanel';
import { useExecutionSocket } from '@/hooks/use-execution-socket';
import { useHorizontalPanelResize, useVerticalPanelResize } from '@/hooks/use-panel-resize';
import { useJudgeActions } from '@/hooks/use-judge-actions';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useToast } from '@/hooks/use-toast';
import { getLanguage } from '@/lib/language-options';
import { ECHO_NUMBER_PROBLEM } from '@/lib/problem';
import {
  BOTTOM_PANELS,
  COLOR_THEME_CLASS,
  PANEL_HEIGHT_BOUNDS,
  SIDEBAR_WIDTH_BOUNDS
} from '@/lib/ui-config';
import { useIDEStore } from '@/store/ide-store';
import type { BottomPanel } from '@/types/ide';
import { useState } from 'react';

function Toast({ message }: { readonly message: string }) {
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

export function IDELayout() {
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const ui = useIDEStore((state) => state.ui);
  const setBottomPanelHeight = useIDEStore((state) => state.setBottomPanelHeight);
  const setSidebarWidth = useIDEStore((state) => state.setSidebarWidth);
  const toggleSidebar = useIDEStore((state) => state.toggleSidebar);
  const resetCode = useIDEStore((state) => state.resetCode);
  const executionId = useIDEStore((state) => state.execution.id);
  const [activePanel, setActivePanel] = useState<BottomPanel>('output');
  const language = getLanguage(selectedLanguage);
  const colorTheme = ui.colorTheme;
  const sidebarWidth = ui.sidebarWidth;
  const { message: toast, notify } = useToast();
  const judgeActions = useJudgeActions({ notify });

  useExecutionSocket(executionId);
  useKeyboardShortcuts({ run: judgeActions.run, submit: judgeActions.submit, save: judgeActions.save });

  const startBottomPanelResize = useVerticalPanelResize({
    currentHeight: ui.bottomPanelHeight,
    min: PANEL_HEIGHT_BOUNDS.min,
    max: PANEL_HEIGHT_BOUNDS.max,
    onResize: setBottomPanelHeight,
  });

  const startSidebarResize = useHorizontalPanelResize({
    currentWidth: sidebarWidth,
    min: SIDEBAR_WIDTH_BOUNDS.min,
    max: SIDEBAR_WIDTH_BOUNDS.max,
    maxViewportRatio: SIDEBAR_WIDTH_BOUNDS.viewportRatio,
    onResize: setSidebarWidth,
  });

  return (
    <div
      className={`${COLOR_THEME_CLASS[colorTheme]} min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_36rem),#070b12] text-slate-100`}
    >
      <AnimatePresence>{toast ? <Toast message={toast} /> : null}</AnimatePresence>
      <div className="flex h-screen min-h-[720px]">
        <aside
          style={{ width: ui.sidebarCollapsed ? undefined : sidebarWidth }}
          className={`${ui.sidebarCollapsed ? 'hidden' : 'hidden lg:block'} shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950/70 p-4 backdrop-blur-xl`}
        >
          <div className="mb-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 shadow-glow">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">Problema</p>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white">{ECHO_NUMBER_PROBLEM.title}</h1>
          </div>
          <ProblemStatementContent compact />
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs leading-5 text-slate-400">
            <b className="text-slate-200">Atajos</b>
            <br />Ctrl+Enter Ejecutar
            <br />Ctrl+Shift+Enter Enviar
            <br />Ctrl+S Guardar
          </div>
        </aside>
        {!ui.sidebarCollapsed ? (
          <div
            aria-label="Redimensionar enunciado"
            role="separator"
            aria-orientation="vertical"
            onPointerDown={startSidebarResize}
            className="vertical-resize-handle group hidden w-3 shrink-0 items-stretch justify-center bg-slate-950/70 transition hover:bg-sky-500/10 lg:flex"
          >
            <span className="my-3 w-1 rounded-full bg-slate-800 transition group-hover:bg-sky-400/70" />
          </div>
        ) : null}

        <main className="flex min-w-0 flex-1 flex-col p-3 md:p-4">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-3 shadow-panel backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <button onClick={toggleSidebar} className="rounded-xl border border-slate-800 px-3 py-2 text-sm font-bold text-slate-300 hover:border-sky-400 hover:text-sky-200">
                ☰
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">Judge Workspace</p>
                <h2 className="text-lg font-black text-white">main.{language.extension}</h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LanguageSelector />
              <button onClick={judgeActions.download} className="h-10 rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:border-sky-400 hover:text-sky-200">
                Descargar
              </button>
              <button onClick={() => resetCode(selectedLanguage)} className="h-10 rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:border-amber-400 hover:text-amber-200">
                Reset
              </button>
              <ExecutionStatus />
              <RunButton running={judgeActions.busyAction === 'run'} onRun={judgeActions.run} />
              <SubmitButton submitting={judgeActions.busyAction === 'submit'} onSubmit={judgeActions.submit} />
            </div>
          </header>

          <section className="min-h-0 flex-1">
            <CodeEditor />
          </section>

          <div onPointerDown={startBottomPanelResize} className="resize-handle my-2 h-2 rounded-full bg-slate-900 transition hover:bg-sky-500/40" />

          <section style={{ height: ui.bottomPanelHeight }} className="min-h-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-panel">
            <div className="mb-2 flex gap-2">
              {BOTTOM_PANELS.map((panel) => (
                <button
                  key={panel}
                  onClick={() => setActivePanel(panel)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold capitalize transition ${activePanel === panel ? 'bg-sky-400 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-slate-200'}`}
                >
                  {panel}
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
        </main>
      </div>
    </div>
  );
}
