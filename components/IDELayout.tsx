'use client';

import { useState } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { BottomPanelArea } from '@/components/ide/BottomPanelArea';
import { ContextStatusBanner } from '@/components/ide/ContextStatusBanner';
import { ProblemSidebar } from '@/components/ide/ProblemSidebar';
import { ToastViewport } from '@/components/ide/ToastViewport';
import { WorkspaceHeader } from '@/components/ide/WorkspaceHeader';
import { useExecutionSocket } from '@/hooks/use-execution-socket';
import { useJudgeActions } from '@/hooks/use-judge-actions';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useHorizontalPanelResize, useVerticalPanelResize } from '@/hooks/use-panel-resize';
import { useToast } from '@/hooks/use-toast';
import { useVibeLaunchContext } from '@/hooks/use-vibe-launch-context';
import { getLanguage } from '@/lib/language-options';
import { COLOR_THEME_CLASS, PANEL_HEIGHT_BOUNDS, SIDEBAR_WIDTH_BOUNDS } from '@/lib/ui-config';
import { useIDEStore } from '@/store/ide-store';
import type { BottomPanel } from '@/types/ide';

export function IDELayout() {
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const ui = useIDEStore((state) => state.ui);
  const availableLanguages = useIDEStore((state) => state.availableLanguages);
  const setBottomPanelHeight = useIDEStore((state) => state.setBottomPanelHeight);
  const setSidebarWidth = useIDEStore((state) => state.setSidebarWidth);
  const toggleSidebar = useIDEStore((state) => state.toggleSidebar);
  const resetCode = useIDEStore((state) => state.resetCode);
  const executionId = useIDEStore((state) => state.execution.id);
  const statusKind = useIDEStore((state) => state.execution.statusKind);
  const launchToken = useIDEStore((state) => state.launchToken);
  const problem = useIDEStore((state) => state.problem);
  const contextStatus = useIDEStore((state) => state.contextStatus);
  const contextError = useIDEStore((state) => state.contextError);
  const judgeFeatures = useIDEStore((state) => state.judgeFeatures);
  const [activePanel, setActivePanel] = useState<BottomPanel>('output');
  const { notify } = useToast();
  const judgeActions = useJudgeActions({ notify });
  const language = getLanguage(selectedLanguage, availableLanguages);

  useVibeLaunchContext(notify);
  useExecutionSocket(executionId, launchToken, statusKind);
  useKeyboardShortcuts({ run: judgeActions.run, submit: judgeActions.submit, save: judgeActions.save });

  const startBottomPanelResize = useVerticalPanelResize({
    currentHeight: ui.bottomPanelHeight,
    min: PANEL_HEIGHT_BOUNDS.min,
    max: PANEL_HEIGHT_BOUNDS.max,
    onResize: setBottomPanelHeight,
  });

  const startSidebarResize = useHorizontalPanelResize({
    currentWidth: ui.sidebarWidth,
    min: SIDEBAR_WIDTH_BOUNDS.min,
    max: SIDEBAR_WIDTH_BOUNDS.max,
    maxViewportRatio: SIDEBAR_WIDTH_BOUNDS.viewportRatio,
    onResize: setSidebarWidth,
  });

  return (
    <div className={`${COLOR_THEME_CLASS[ui.colorTheme]} min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_36rem),#070b12] text-slate-100`}>
      <ToastViewport />
      <div className="flex h-screen min-h-[720px]">
        <ProblemSidebar collapsed={ui.sidebarCollapsed} width={ui.sidebarWidth} problem={problem} onResizeStart={startSidebarResize} />

        <main className="flex min-w-0 flex-1 flex-col p-2 md:p-3">
          <WorkspaceHeader
            fileExtension={language.extension}
            busyAction={judgeActions.busyAction}
            contextStatus={contextStatus}
            judgeFeatures={judgeFeatures}
            onDownload={judgeActions.download}
            onReset={() => resetCode(selectedLanguage)}
            onRun={judgeActions.run}
            onSubmit={judgeActions.submit}
            onToggleSidebar={toggleSidebar}
          />
          <ContextStatusBanner status={contextStatus} error={contextError} />

          <section className="min-h-0 flex-1">
            <CodeEditor />
          </section>

          <div onPointerDown={startBottomPanelResize} className="resize-handle my-2 h-2 rounded-full bg-slate-900 transition hover:bg-sky-500/40" />
          <BottomPanelArea activePanel={activePanel} height={ui.bottomPanelHeight} onPanelChange={setActivePanel} />
        </main>
      </div>
    </div>
  );
}
