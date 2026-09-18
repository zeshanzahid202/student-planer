import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PlannerPage from './pages/Planner/PlannerPage';
import TasksPage from './pages/Tasks/TasksPage';
import CoursesPage from './pages/Courses/CoursesPage';
import FocusPage from './pages/Focus/FocusPage';
import SettingsPage from './pages/Settings/SettingsPage';
import { api } from './services/api';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Loading StudyAI...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function MainApp() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [streak, setStreak] = useState(0);

  const loadGlobalMeta = async () => {
    if (user) {
      try {
        const [cRes, aRes] = await Promise.all([
          api.getCourses(),
          api.getAnalytics()
        ]);
        setCourses(cRes.courses || []);
        setStreak(aRes.study_streak || 0);
      } catch (err) {
        console.error('Error loading global meta:', err);
      }
    }
  };

  useEffect(() => {
    loadGlobalMeta();
  }, [user]);

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout 
              onTaskAdded={loadGlobalMeta} 
              streak={streak} 
              courses={courses} 
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  );
}
