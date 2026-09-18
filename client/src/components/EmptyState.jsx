import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Sparkles, 
  title = "No data yet", 
  description = "Get started by adding your first item.", 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-semibold text-white mb-1.5">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all shadow-lg shadow-brand-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
