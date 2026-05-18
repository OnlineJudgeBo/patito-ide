'use client';

import { useCallback, useMemo, useState, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CodeEditor } from '@/components/CodeEditor';
import { ExecutionStatus } from '@/components/ExecutionStatus';
import { InputPanel } from '@/components/InputPanel';
import { LanguageSelector } from '@/components/LanguageSelector';
import { OutputPanel } from '@/components/OutputPanel';
import { RunButton } from '@/components/RunButton';
import { SubmitButton } from '@/components/SubmitButton';
import { TestcasePanel } from '@/components/TestcasePanel';
import { useExecutionSocket } from '@/hooks/use-execution-socket';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { getLanguage } from '@/lib/languages';
import { runCode, submitCode } from '@/services/judge-api';
import { useIDEStore } from '@/store/ide-store';
import type { ExecutionResult } from '@/types/ide';

function Toast({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="fixed right-4 top-4 z-50 rounded-xl border border-sky-400/30 bg-slate-950/95 px-4 py-3 text-sm text-sky-100 shadow-glow backdrop-blur">
      {message}
    </motion.div>
  );
}

export function IDELayout() {
  const [toast, setToast] = useState('');
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const codeByLanguage = useIDEStore((state) => state.codeByLanguage);
  const stdin = useIDEStore((state) => state.stdin);
  const testcases = useIDEStore((state) => state.testcases);
  const ui = useIDEStore((state) => state.ui);
  const setExecution = useIDEStore((state) => state.setExecution);
  const addLog = useIDEStore((state) => state.addLog);
  const setBottomPanelHeight = useIDEStore((state) => state.setBottomPanelHeight);
  const toggleMinimap = useIDEStore((state) => state.toggleMinimap);
  const toggleSidebar = useIDEStore((state) => state.toggleSidebar);
  const resetCode = useIDEStore((state) => state.resetCode);
  const language = getLanguage(selectedLanguage);
  const executionId = useIDEStore((state) => state.execution.id);
  useExecutionSocket(executionId);
  const [activePanel, setActivePanel] = useState<'output' | 'input' | 'testcases'>('output');
  const [busyAction, setBusyAction] = useState<'run' | 'submit' | null>(null);

  const payload = useMemo(
    () => ({ sourceCode: codeByLanguage[selectedLanguage], language: selectedLanguage, stdin, testcases }),
    [codeByLanguage, selectedLanguage, stdin, testcases],
  );

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }, []);

  const handleRun = useCallback(async () => {
    setBusyAction('run');
    setExecution({ phase: 'queued', verdict: 'Pending', stdout: '', stderr: '', compileErrors: '', logs: ['Run requested.'] });
    try {
      const response = await runCode(payload);
      const result: ExecutionResult = response.result ?? {
        id: response.runId,
        phase: 'running',
        verdict: 'Pending',
        stdout: '',
        stderr: '',
        compileErrors: '',
        logs: ['Run accepted by judge backend. Waiting for WebSocket status updates.'],
      };
      setExecution(result);
      notify('Run sent to judge backend.');
    } catch (error) {
      setExecution({ phase: 'error', verdict: 'Internal Error', logs: [error instanceof Error ? error.message : 'Unknown run error'] });
      notify('Could not run code. Check judge API settings.');
    } finally {
      setBusyAction(null);
    }
  }, [notify, payload, setExecution]);

  const handleSubmit = useCallback(async () => {
    setBusyAction('submit');
    setExecution({ phase: 'queued', verdict: 'Pending', logs: ['Submission queued.'] });
    try {
      const response = await submitCode({ ...payload, problemId: 'local-problem' });
      setExecution({ id: response.submissionId, phase: 'running', verdict: 'Pending', logs: ['Submission accepted. WebSocket status stream is ready.'] });
      notify(`Submission ${response.submissionId} created.`);
    } catch (error) {
      setExecution({ phase: 'error', verdict: 'Internal Error', logs: [error instanceof Error ? error.message : 'Unknown submission error'] });
      notify('Could not submit. Check judge API settings.');
    } finally {
      setBusyAction(null);
    }
  }, [notify, payload, setExecution]);

  const handleSave = useCallback(() => {
    addLog('Workspace saved locally.');
    notify('Saved locally.');
  }, [addLog, notify]);

  useKeyboardShortcuts({ run: handleRun, submit: handleSubmit, save: handleSave });

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    const startY = event.clientY;
    const startHeight = ui.bottomPanelHeight;
    const onMove = (moveEvent: PointerEvent) => setBottomPanelHeight(Math.min(520, Math.max(220, startHeight - (moveEvent.clientY - startY))));
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_36rem),#070b12] text-slate-100">
      <AnimatePresence>{toast ? <Toast message={toast} /> : null}</AnimatePresence>
      <div className="flex h-screen min-h-[720px]">
        <aside className={`${ui.sidebarCollapsed ? 'hidden' : 'hidden w-72'} border-r border-slate-800 bg-slate-950/70 p-4 backdrop-blur-xl lg:block`}>
          <div className="mb-6 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 shadow-glow">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">Vibe Judge</p>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white">Competitive IDE</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Fast editor, custom input, testcases, submissions and WebSocket-ready judge status.</p>
          </div>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3"><b className="text-slate-200">Problem</b><br />Echo Number</div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3"><b className="text-slate-200">Constraints</b><br />1 ≤ n ≤ 10⁹</div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3"><b className="text-slate-200">Shortcuts</b><br />Ctrl+Enter Run<br />Ctrl+Shift+Enter Submit<br />Ctrl+S Save</div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col p-3 md:p-4">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-3 shadow-panel backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <button onClick={toggleSidebar} className="rounded-xl border border-slate-800 px-3 py-2 text-sm font-bold text-slate-300 hover:border-sky-400 hover:text-sky-200">☰</button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">Judge Workspace</p>
                <h2 className="text-lg font-black text-white">main.{language.extension}</h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LanguageSelector />
              <button onClick={toggleMinimap} className="h-10 rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:border-sky-400 hover:text-sky-200">Minimap {ui.minimap ? 'On' : 'Off'}</button>
              <button onClick={() => resetCode(selectedLanguage)} className="h-10 rounded-xl border border-slate-800 px-3 text-sm font-semibold text-slate-300 hover:border-amber-400 hover:text-amber-200">Reset</button>
              <ExecutionStatus />
              <RunButton running={busyAction === 'run'} onRun={handleRun} />
              <SubmitButton submitting={busyAction === 'submit'} onSubmit={handleSubmit} />
            </div>
          </header>

          <section className="min-h-0 flex-1">
            <CodeEditor />
          </section>

          <div onPointerDown={startResize} className="resize-handle my-2 h-2 rounded-full bg-slate-900 transition hover:bg-sky-500/40" />

          <section style={{ height: ui.bottomPanelHeight }} className="min-h-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-panel">
            <div className="mb-2 flex gap-2">
              {(['output', 'input', 'testcases'] as const).map((panel) => (
                <button key={panel} onClick={() => setActivePanel(panel)} className={`rounded-xl px-3 py-2 text-sm font-bold capitalize transition ${activePanel === panel ? 'bg-sky-400 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-slate-200'}`}>{panel}</button>
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
