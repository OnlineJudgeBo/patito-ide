import type { Verdict } from '@/types/ide';

export const verdictStyles: Record<Verdict, string> = {
  Accepted: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  'Wrong Answer': 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  'Compilation Error': 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  'Runtime Error': 'border-red-400/30 bg-red-400/10 text-red-300',
  'Time Limit Exceeded': 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  Pending: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  'Internal Error': 'border-slate-400/30 bg-slate-400/10 text-slate-300',
};
