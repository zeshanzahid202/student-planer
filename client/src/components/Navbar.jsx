import React from 'react';
import { Menu, Plus, Bell, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick, onQuickAddTask, streak = 0 }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs text-slate-400 font-medium">{today}</span>
          <h2 className="text-sm sm:text-base font-semibold text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{streak}d streak</span>
        </div>

        {/* Quick Add Button */}
        {onQuickAddTask && (
          <button
            onClick={onQuickAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-medium transition-all shadow-md shadow-brand-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        )}
      </div>
    </header>
  );
}
