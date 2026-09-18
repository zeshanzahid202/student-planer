import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, iconColor = 'text-brand-400', iconBg = 'bg-brand-500/10' }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</span>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
