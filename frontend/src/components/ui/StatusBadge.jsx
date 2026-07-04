import { clsx } from 'clsx';

const colors = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  ONLINE: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  RUNNING: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  QUEUED: 'bg-slate-500/20 text-slate-300 border-slate-400/30',
  SCHEDULED: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
  CLAIMED: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
  RETRY_PENDING: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  FAILED: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  DEAD_LETTER: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  PAUSED: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  OFFLINE: 'bg-slate-500/20 text-slate-300 border-slate-400/30',
  STALE: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  ARCHIVED: 'bg-slate-500/20 text-slate-300 border-slate-400/30'
};

export function StatusBadge({ value }) {
  return (
    <span className={clsx('inline-flex rounded-full border px-2 py-1 text-xs font-semibold', colors[value] || 'border-line bg-panel text-steel')}>
      {value || '-'}
    </span>
  );
}
