import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  Play, 
  Check, 
  BookOpen,
  TrendingUp,
  Plus
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import { PriorityBadge } from '../../components/Badge';
import { CardSkeleton, ListSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [anaRes, planRes] = await Promise.all([
        api.getAnalytics(),
        api.getCurrentPlan()
      ]);
      setAnalytics(anaRes);
      setCurrentPlan(planRes.plan);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleSessionStatus = async (sessionId, currentCompleted) => {
    try {
      await api.updateSessionStatus(sessionId, !currentCompleted);
      // Update local plan state
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

  const handleToggleTask = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.updateTask(task.id, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-4">
            <ListSkeleton count={3} />
          </div>
          <div className="space-y-4">
            <ListSkeleton count={2} />
          </div>
        </div>
      </div>
    );
  }

  const todaySchedule = currentPlan?.schedule?.find(d => d.is_today) || currentPlan?.schedule?.[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / AI Recommendation */}
      <div className="bg-gradient-to-r from-brand-900/50 via-slate-900 to-indigo-950/40 border border-brand-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>AI Study Insight of the Day</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {todaySchedule?.focus_tip || "Prioritize high-yield topics first using Active Recall."}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Targeting {analytics?.daily_goal_hours || 4} hours of focused study today. You have {analytics?.high_priority_tasks || 0} high-priority deadlines approaching.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-brand-600/30 active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{currentPlan ? 'View AI Schedule' : 'Generate AI Plan'}</span>
            </Link>
            <Link
              to="/focus"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all border border-slate-700 active:scale-95 whitespace-nowrap"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Start Focus</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Daily Study Hours"
          value={`${analytics?.total_study_hours || 0} hrs`}
          subtitle={`Goal: ${analytics?.daily_goal_hours || 4} hrs/day`}
          icon={Clock}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
        <StatCard
          title="Study Streak"
          value={`${analytics?.study_streak || 0} Days`}
          subtitle="Consistency multiplier"
          icon={Flame}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
        <StatCard
          title="Tasks Completed"
          value={`${analytics?.completed_tasks || 0} / ${analytics?.total_tasks || 0}`}
          subtitle={`${analytics?.completion_rate || 0}% completion rate`}
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="Urgent Deadlines"
          value={analytics?.upcoming_deadlines?.length || 0}
          subtitle="Due within 7 days"
          icon={AlertCircle}
          iconColor="text-rose-400"
          iconBg="bg-rose-500/10"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's AI Study Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span>Today's AI Study Schedule</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {todaySchedule?.day} ({todaySchedule?.total_minutes || 0} mins planned)
                </p>
              </div>
              <Link to="/planner" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
                Full 7-day view <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todaySchedule?.sessions && todaySchedule.sessions.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-xl border transition-all flex items-start sm:items-center justify-between gap-3 ${
                      session.completed 
                        ? 'bg-slate-950/40 border-slate-800/50 opacity-60' 
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleSessionStatus(session.id, session.completed)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all mt-0.5 sm:mt-0 ${
                          session.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-slate-700 hover:border-brand-500'
                        }`}
                      >
                        {session.completed && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span 
                            className="px-2 py-0.5 rounded text-[11px] font-semibold"
                            style={{ backgroundColor: `${session.course_color}20`, color: session.course_color }}
                          >
                            {session.course_name}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {session.time_slot}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            • {session.duration_minutes}m
                          </span>
                        </div>
                        <h4 className={`text-sm font-semibold truncate ${session.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {session.task_title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{session.type}</p>
                      </div>
                    </div>

                    <Link
                      to="/focus"
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-brand-600 hover:text-white text-slate-300 transition-colors flex-shrink-0"
                      title="Launch timer for this session"
                    >
                      <Play className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="No active schedule for today"
                description="Generate a personalized study timetable with 1 click."
                actionLabel="Generate AI Plan"
                onAction={() => window.location.href = '/planner'}
              />
            )}
          </div>

          {/* Weekly Activity Progress */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Weekly Study Activity</span>
            </h3>
            <div className="grid grid-cols-7 gap-2 pt-2">
              {analytics?.weekly_activity?.map((day, idx) => {
                const heightPercent = Math.min(100, Math.round((day.hours / (analytics?.daily_goal_hours || 4)) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-950 rounded-xl h-28 flex items-end p-1.5 justify-center border border-slate-800/60">
                      <div 
                        className="w-full bg-brand-500/80 hover:bg-brand-400 transition-all rounded-lg"
                        style={{ height: `${Math.max(8, heightPercent)}%` }}
                        title={`${day.hours} hours on ${day.day}`}
                      ></div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">{day.day}</span>
                    <span className="text-[10px] text-slate-500">{day.hours}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Urgent Deadlines & Course Breakdown */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Upcoming Deadlines</span>
              </h3>
              <Link to="/tasks" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
                View All
              </Link>
            </div>

            {analytics?.upcoming_deadlines && analytics.upcoming_deadlines.length > 0 ? (
              <div className="space-y-2.5">
                {analytics.upcoming_deadlines.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-400">
                          Due: {task.due_date}
                        </span>
                        {task.course_name && (
                          <span 
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ backgroundColor: `${task.course_color}20`, color: task.course_color }}
                          >
                            {task.course_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                🎉 No pending deadlines in the next 7 days!
              </p>
            )}
          </div>

          {/* Course Workload Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Enrolled Courses</span>
              </h3>
              <Link to="/courses" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
                Manage
              </Link>
            </div>

            {analytics?.course_breakdown && analytics.course_breakdown.length > 0 ? (
              <div className="space-y-3">
                {analytics.course_breakdown.map((course) => (
                  <div key={course.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate">{course.name}</span>
                      <span className="text-slate-400">{Number((course.total_minutes / 60).toFixed(1))}h studied</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: course.color || '#6366f1',
                          width: `${Math.min(100, Math.max(15, (course.total_minutes / (analytics.total_study_minutes || 1)) * 100))}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No courses added yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
