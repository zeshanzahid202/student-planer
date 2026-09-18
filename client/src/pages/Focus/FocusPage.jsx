import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';

const TIMER_MODES = [
  { id: 'focus', label: 'Deep Focus', minutes: 25, icon: Flame, color: 'text-brand-400', bg: 'bg-brand-600' },
  { id: 'short_break', label: 'Short Break', minutes: 5, icon: Coffee, color: 'text-emerald-400', bg: 'bg-emerald-600' },
  { id: 'long_break', label: 'Long Break', minutes: 15, icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-600' },
];

export default function FocusPage() {
  const [mode, setMode] = useState('focus');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logSuccess, setLogSuccess] = useState(false);

  const timerRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, tasksRes, sessionsRes] = await Promise.all([
        api.getCourses(),
        api.getTasks({ status: 'pending' }),
        api.getSessions()
      ]);
      setCourses(coursesRes.courses || []);
      setTasks(tasksRes.tasks || []);
      setSessions(sessionsRes.sessions || []);
    } catch (err) {
      console.error('Failed to load focus data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const switchMode = (newModeId) => {
    setIsActive(false);
    clearInterval(timerRef.current);
    const found = TIMER_MODES.find(m => m.id === newModeId) || TIMER_MODES[0];
    setMode(found.id);
    setDurationMinutes(found.minutes);
    setSecondsRemaining(found.minutes * 60);
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            handleSessionCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const handleSessionCompleted = async () => {
    try {
      if (mode === 'focus') {
        const res = await api.createSession({
          course_id: selectedCourse ? parseInt(selectedCourse) : null,
          task_id: selectedTask ? parseInt(selectedTask) : null,
          duration_minutes: durationMinutes,
          notes: notes.trim(),
          session_date: new Date().toISOString().split('T')[0]
        });
        setSessions([res.session, ...sessions]);
        setLogSuccess(true);
        setTimeout(() => setLogSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Failed to log session:', err);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setSecondsRemaining(durationMinutes * 60);
  };

  const handleDeleteSession = async (id) => {
    try {
      await api.deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSecs = durationMinutes * 60;
  const progressPercent = ((totalSecs - secondsRemaining) / totalSecs) * 100;

  const currentModeObj = TIMER_MODES.find(m => m.id === mode) || TIMER_MODES[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2.5">
          <Timer className="w-7 h-7 text-brand-400" />
          <span>Focus & Pomodoro Timer</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Eliminate distractions, build momentum, and automatically record verified study hours.
        </p>
      </div>

      {logSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Awesome job! {durationMinutes} minutes of study logged to your profile.</span>
        </div>
      )}

      {/* Main Timer Container */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto flex flex-col items-center">
        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-8">
          {TIMER_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === m.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <m.icon className="w-4 h-4" />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Circular Countdown Progress */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className={mode === 'focus' ? 'text-brand-500' : mode === 'short_break' ? 'text-emerald-500' : 'text-amber-500'}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tighter text-white">
              {timeFormatted}
            </span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
              {currentModeObj.label}
            </span>
          </div>
        </div>

        {/* Controls (Play, Pause, Reset) */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
              isActive 
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30' 
                : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30'
            }`}
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
          </button>
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-all active:scale-95"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Association (Course & Task Tagging) */}
        {mode === 'focus' && (
          <div className="w-full space-y-4 pt-6 border-t border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="">General Study Session</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Associated Task</label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 truncate"
                >
                  <option value="">None / Custom Session</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Focus Notes</label>
              <input
                type="text"
                placeholder="What are you focusing on during this block?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Recent Sessions History Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-400" />
          <span>Recently Logged Study Sessions</span>
        </h3>

        {sessions.length > 0 ? (
          <div className="space-y-2.5">
            {sessions.slice(0, 8).map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {session.duration_minutes}m
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                      {session.task_title || session.notes || 'Focused Study Session'}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{session.session_date}</span>
                      {session.course_name && (
                        <span 
                          className="px-1.5 py-0.2 rounded text-[10px] font-medium"
                          style={{ backgroundColor: `${session.course_color}20`, color: session.course_color }}
                        >
                          {session.course_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            No study sessions logged yet. Complete a Pomodoro session above to record your focus time!
          </p>
        )}
      </div>
    </div>
  );
}
