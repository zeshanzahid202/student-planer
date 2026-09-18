import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Modal from './Modal';
import { api } from '../services/api';

export default function Layout({ onTaskAdded, streak = 0, courses = [] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    course_id: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    estimated_minutes: 60
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.createTask({
        ...taskForm,
        course_id: taskForm.course_id ? parseInt(taskForm.course_id) : null,
        estimated_minutes: parseInt(taskForm.estimated_minutes) || 60
      });
      setQuickTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        course_id: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        estimated_minutes: 60
      });
      if (onTaskAdded) onTaskAdded();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)}
          onQuickAddTask={() => setQuickTaskModalOpen(true)}
          streak={streak}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={quickTaskModalOpen}
        onClose={() => setQuickTaskModalOpen(false)}
        title="Quick Add Task & Deadline"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4 Quiz Preparation"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Course / Subject</label>
              <select
                value={taskForm.course_id}
                onChange={(e) => setTaskForm({ ...taskForm, course_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              >
                <option value="">General / None</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Estimated Time (min)</label>
              <input
                type="number"
                min="10"
                step="5"
                value={taskForm.estimated_minutes}
                onChange={(e) => setTaskForm({ ...taskForm, estimated_minutes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description / Notes</label>
            <textarea
              rows="2"
              placeholder="Key concepts or textbook page numbers..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQuickTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-medium transition-all shadow-md shadow-brand-600/25"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
