import React from 'react';

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 bg-slate-800 rounded w-28"></div>
            <div className="h-8 w-8 bg-slate-800 rounded-xl"></div>
          </div>
          <div className="h-7 bg-slate-800 rounded w-20 mb-3"></div>
          <div className="h-3 bg-slate-800 rounded w-36"></div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-3 bg-slate-800 rounded w-1/4"></div>
          </div>
          <div className="h-6 bg-slate-800 rounded-full w-20"></div>
        </div>
      ))}
    </div>
  );
}
