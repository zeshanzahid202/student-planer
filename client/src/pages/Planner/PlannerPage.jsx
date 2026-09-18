import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  Check, 
  Sliders, 
  Layers, 
  Zap, 
  Coffee, 
  BookOpen,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';

export default function PlannerPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // AI Configuration state
  const [dailyGoalHours, setDailyGoalHours] = useState(4);
  const [studyPreference, setStudyPreference] = useState('evening');
  const [intensity, setIntensity] = useState('balanced');

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await api.getCurrentPlan();
      if (res.plan) {
        setCurrentPlan(res.plan);
        if (res.plan.target_hours_per_day) {
          setDailyGoalHours(res.plan.target_hours_per_day);
        }
      }
    } catch (err) {
      console.error('Failed to fetch plan:', err);
      setError(err.message || 'Failed to load study plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleGeneratePlan = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await api.generatePlan({
        dailyGoalHours: parseFloat(dailyGoalHours),
        studyPreference,
        intensity
      });
      setCurrentPlan(res.plan);
    } catch (err) {
      console.error('Failed to generate AI plan:', err);
      setError(err.message || 'Failed to generate study plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleSession = async (sessionId, currentCompleted) => {
    try {
      await api.updateSessionStatus(sessionId, !currentCompleted);
      if (currentPlan) {
        const updatedSchedule = currentPlan.schedule.map(day => ({
          ...day,
          sessions: day.sessions.map(s => s.id === sessionId ? { ...s, completed: !currentCompleted } : s)
        }));
        setCurrentPlan({ ...currentPlan, schedule: updatedSchedule });
      }
    } catch (err) {
      console.error('Failed to update session:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 bg-slate-800 rounded w-64 animate-pulse"></div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Controls Panel */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>AI Study Schedule Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Personalized 7-Day Masterplan
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
              Our intelligent heuristic algorithm balances your course load, deadlines, and study preferences into optimal focus blocks.
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/30 active:scale-95 whitespace-nowrap"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Optimizing Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{currentPlan ? 'Regenerate Study Plan' : 'Generate AI Study Plan'}</span>
              </>
            )}
          </button>
        </div>

        {/* Configuration Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Target Hours */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-400" />
                Daily Study Target
              </span>
              <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-md">
                {dailyGoalHours} hours/day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={dailyGoalHours}
              onChange={(e) => setDailyGoalHours(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 hr (Light)</span>
              <span>4 hrs (Standard)</span>
              <span>8 hrs (Intensive)</span>
            </div>
          </div>

          {/* Time Preference */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Preferred Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'morning', label: '🌅 Morning' },
                { id: 'afternoon', label: '☀️ Afternoon' },
                { id: 'evening', label: '🌙 Evening' },
                { id: 'flexible', label: '⚡ Flexible' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStudyPreference(opt.id)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-medium border transition-all ${
                    studyPreference === opt.id
                      ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Schedule Intensity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'relaxed', label: 'Relaxed' },
                { id: 'balanced', label: 'Balanced' },
                { id: 'exam_sprint', label: 'Sprint' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIntensity(opt.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                    intensity === opt.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Plan Summary Bar */}
      {currentPlan && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Planned Hours</p>
              <p className="text-lg font-bold text-white">{currentPlan.total_planned_hours} hrs / week</p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Active Courses</p>
              <p className="text-lg font-bold text-white">{currentPlan.summary?.courses_active || 0} enrolled</p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Rest Intervals</p>
              <p className="text-xs font-semibold text-slate-200">5 min break / 25m Pomodoro</p>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Timetable Grid */}
      {currentPlan ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentPlan.schedule?.map((day, idx) => (
              <div
                key={idx}
                className={`bg-slate-900/90 border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                  day.is_today 
                    ? 'border-brand-500/60 ring-1 ring-brand-500/30 shadow-lg shadow-brand-500/5' 
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{day.day}</span>
                        {day.is_today && (
                          <span className="px-1.5 py-0.5 rounded bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{day.date}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {Number((day.total_minutes / 60).toFixed(1))}h
                    </span>
                  </div>

                  {/* Daily Tip */}
                  <div className="mb-3.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
                    <span>{day.focus_tip}</span>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-2.5">
                    {day.sessions?.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-xl border transition-all ${
                          session.completed
                            ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                            : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span 
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                            style={{ backgroundColor: `${session.course_color}20`, color: session.course_color }}
                          >
                            {session.course_name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {session.time_slot}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => handleToggleSession(session.id, session.completed)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                              session.completed 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-700 hover:border-brand-500'
                            }`}
                          >
                            {session.completed && <Check className="w-3 h-3" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <h5 className={`text-xs font-semibold leading-tight truncate ${session.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {session.task_title}
                            </h5>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{session.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/60 text-center">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {day.sessions?.filter(s => s.completed).length || 0} of {day.sessions?.length || 0} completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No AI Study Plan Generated"
          description="Configure your study preferences above and click Generate to create a 7-day optimized schedule."
          actionLabel="Generate 7-Day AI Plan"
          onAction={handleGeneratePlan}
        />
      )}
    </div>
  );
}
