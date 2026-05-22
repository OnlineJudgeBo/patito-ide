import type { LspStatus } from '@/lsp/types';

const lspStatusClassName: Readonly<Record<LspStatus, string>> = {
  connected: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  connecting: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  error: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  disabled: 'border-slate-700 bg-slate-900 text-slate-500',
};

type LspStatusBadgeProps = {
  readonly status: LspStatus;
  readonly detail: string;
  readonly serverName: string;
};

export function LspStatusBadge({ status, detail, serverName }: LspStatusBadgeProps) {
  return (
    <span title={detail} className={`rounded-full border px-2 py-1 font-semibold ${lspStatusClassName[status]}`}>
      LSP: {serverName}
    </span>
  );
}
