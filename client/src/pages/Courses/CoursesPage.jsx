import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  User, 
  Award, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  GraduationCap,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const COLOR_OPTIONS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    instructor: '',
    color: '#6366f1',
    credits: 3,
    grade_target: 'A'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.getCourses();
      setCourses(res.courses || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setForm({
      name: '',
      code: '',
      instructor: '',
      color: '#6366f1',
      credits: 3,
      grade_target: 'A'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setForm({
      name: course.name,
      code: course.code || '',
      instructor: course.instructor || '',
      color: course.color || '#6366f1',
      credits: course.credits || 3,
      grade_target: course.grade_target || 'A'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...form,
        credits: parseInt(form.credits) || 3
      };

      if (editingCourse) {
        await api.updateCourse(editingCourse.id, payload);
      } else {
        await api.createCourse(payload);
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? Associated tasks will be detached.')) return;
    try {
      await api.deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-brand-400" />
            <span>Courses & Academic Subjects</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track course credits, target grades, instructors, and syllabus tasks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-600/30 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const progress = course.total_tasks > 0 
              ? Math.round((course.completed_tasks / course.total_tasks) * 100) 
              : 0;

            return (
              <div
                key={course.id}
                className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Color Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-3.5 h-3.5 rounded-full ring-4"
                        style={{ backgroundColor: course.color, ringColor: `${course.color}30` }}
                      ></div>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {course.code || 'COURSE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        title="Edit Course"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-base font-bold text-white mb-2 leading-tight">
                    {course.name}
                  </h3>

                  {/* Meta badges */}
                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    {course.instructor && (
                      <p className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.instructor}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-4 pt-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-brand-400" />
                        {course.credits} Credits
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Award className="w-3.5 h-3.5" />
                        Target: {course.grade_target}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Task Completion</span>
                    <span className="font-semibold text-slate-200">
                      {course.completed_tasks || 0} / {course.total_tasks || 0} ({progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: course.color || '#6366f1',
                        width: `${progress}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses registered"
          description="Add your enrolled subjects and classes to generate accurate study schedules."
          actionLabel="Add First Course"
          onAction={openCreateModal}
        />
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Course Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Data Structures and Algorithms"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CS201"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Instructor</label>
              <input
                type="text"
                placeholder="e.g. Prof. Davis"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Credit Hours</label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Grade</label>
              <select
                value={form.grade_target}
                onChange={(e) => setForm({ ...form, grade_target: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="A+">A+ (4.0)</option>
                <option value="A">A (4.0)</option>
                <option value="A-">A- (3.7)</option>
                <option value="B+">B+ (3.3)</option>
                <option value="B">B (3.0)</option>
                <option value="Pass">Pass</option>
              </select>
            </div>
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Color Accent</label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-all ${
                    form.color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                ></button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-medium transition-all shadow-md shadow-brand-600/25"
            >
              {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
