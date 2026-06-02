'use client';

import { ProblemStatementContent } from '@/components/ProblemStatement';
import { ECHO_NUMBER_PROBLEM } from '@/lib/problem';
import type { PointerEvent } from 'react';
import type { ProblemStatement } from '@/types/ide';

type ProblemSidebarProps = {
  readonly collapsed: boolean;
  readonly width: number;
  readonly problem?: ProblemStatement;
  readonly onResizeStart: (event: PointerEvent<HTMLDivElement>) => void;
};

export function ProblemSidebar({ collapsed, width, problem, onResizeStart }: ProblemSidebarProps) {
  return (
    <>
      <aside
        style={{ width: collapsed ? undefined : width }}
        className={`${collapsed ? 'hidden' : 'hidden lg:block'} shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950/70 p-4 backdrop-blur-xl`}
      >
        <div className="mb-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 shadow-glow">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">Problema</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-white">{problem?.title ?? ECHO_NUMBER_PROBLEM.title}</h1>
        </div>
        <ProblemStatementContent compact />
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs leading-5 text-slate-400">
          <b className="text-slate-200">Atajos</b>
          <br />Ctrl+Enter Ejecutar
          <br />Ctrl+Shift+Enter Enviar
          <br />Ctrl+S Guardar
        </div>
      </aside>
      {!collapsed ? (
        <div
          aria-label="Redimensionar enunciado"
          role="separator"
          aria-orientation="vertical"
          onPointerDown={onResizeStart}
          className="vertical-resize-handle group hidden w-3 shrink-0 items-stretch justify-center bg-slate-950/70 transition hover:bg-sky-500/10 lg:flex"
        >
          <span className="my-3 w-1 rounded-full bg-slate-800 transition group-hover:bg-sky-400/70" />
        </div>
      ) : null}
    </>
  );
}
