const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('planner_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Courses
  getCourses: () => request('/courses'),
  createCourse: (courseData) => request('/courses', { method: 'POST', body: JSON.stringify(courseData) }),
  updateCourse: (id, courseData) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(courseData) }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.course_id) query.append('course_id', params.course_id);
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/tasks${qs}`);
  },
  createTask: (taskData) => request('/tasks', { method: 'POST', body: JSON.stringify(taskData) }),
  updateTask: (id, taskData) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(taskData) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Study Sessions
  getSessions: () => request('/sessions'),
  createSession: (sessionData) => request('/sessions', { method: 'POST', body: JSON.stringify(sessionData) }),
  deleteSession: (id) => request(`/sessions/${id}`, { method: 'DELETE' }),

  // AI Planner
  generatePlan: (planParams) => request('/planner/generate', { method: 'POST', body: JSON.stringify(planParams) }),
  getCurrentPlan: () => request('/planner/current'),
  updateSessionStatus: (sessionId, completed) => request('/planner/session-status', { method: 'POST', body: JSON.stringify({ sessionId, completed }) }),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // Health
  checkHealth: () => request('/health'),
};
