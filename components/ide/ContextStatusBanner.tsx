'use client';

import type { ContextLoadState } from '@/types/ide';

type ContextStatusBannerProps = {
  readonly status: ContextLoadState;
  readonly error?: string;
};

export function ContextStatusBanner({ status, error }: ContextStatusBannerProps) {
  if (status !== 'loading' && status !== 'error') return null;

  const isError = status === 'error';
  return (
    <div className={`mb-3 rounded-xl border px-4 py-3 text-sm ${isError ? 'border-rose-400/30 bg-rose-950/30 text-rose-100' : 'border-sky-400/20 bg-sky-950/20 text-sky-100'}`}>
      {status === 'loading' ? 'Cargando contexto del juez…' : null}
      {isError ? `No se pudo cargar el contexto del juez: ${error ?? 'error desconocido'}` : null}
    </div>
  );
}
