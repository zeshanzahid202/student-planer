import React from 'react';

export function PriorityBadge({ priority }) {
  const styles = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const labels = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };

  const style = styles[priority?.toLowerCase()] || styles.medium;
  const label = labels[priority?.toLowerCase()] || priority;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    in_progress: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    pending: 'bg-slate-700/50 text-slate-300 border-slate-600/30',
  };

  const labels = {
    completed: 'Completed',
    in_progress: 'In Progress',
    pending: 'Pending',
  };

  const style = styles[status?.toLowerCase()] || styles.pending;
  const label = labels[status?.toLowerCase()] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
}
