import { verdictStyles } from '@/lib/verdict';
import type { Verdict } from '@/types/ide';

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${verdictStyles[verdict]}`}>{verdict}</span>;
}
