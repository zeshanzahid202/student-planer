import React, { useState, useEffect } from 'react';
import { Settings, User, Clock, CheckCircle2, Shield, Sparkles, Server } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [dailyGoal, setDailyGoal] = useState(user?.daily_study_goal_hours || 4);
  const [theme, setTheme] = useState(user?.theme || 'dark');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDailyGoal(user.daily_study_goal_hours || 4);
      setTheme(user.theme || 'dark');
    }
    api.checkHealth()
      .then(res => setBackendStatus(`Online (${res.status})`))
      .catch(() => setBackendStatus('Offline / Connection Error'));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await updateProfile({
        name: name.trim(),
        daily_study_goal_hours: parseFloat(dailyGoal),
        theme
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-400" />
          <span>Account & Study Preferences</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your study goals, timetable defaults, and account details.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-brand-400" />
            <span>Profile Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/50 text-slate-500 text-sm cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500">Email cannot be changed directly.</span>
            </div>
          </div>
        </div>

        {/* Study Targets Card */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Study Goals & Targets</span>
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Default Daily Study Goal</span>
              <span className="font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 rounded-lg">
                {dailyGoal} hours / day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <p className="text-xs text-slate-400">
              The AI Planner will use this default target when generating your weekly timetable.
            </p>
          </div>
        </div>

        {/* System & API Status */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Server className="w-4 h-4 text-amber-400" />
            <span>System & Architecture Status</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Backend REST API</span>
              <span className="font-semibold text-emerald-400">{backendStatus}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Database Engine</span>
              <span className="font-semibold text-indigo-400">SQLite Persistent Storage</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">AI Scheduling Engine</span>
              <span className="font-semibold text-brand-400">Algorithmic Heuristics (Active)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Authentication</span>
              <span className="font-semibold text-emerald-400">JWT + bcrypt (Secure)</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/30 active:scale-95"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
