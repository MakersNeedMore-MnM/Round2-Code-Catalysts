import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (ignore 401 on login endpoints to allow error handling in form)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register') || err.config?.url?.includes('/auth/admin-login');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('rg_token');
      localStorage.removeItem('rg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (loginId: string, password: string) =>
    api.post('/auth/login', { loginId, password }),
  adminLogin: (email: string, password: string) =>
    api.post('/auth/admin-login', { email, password }),
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string; city?: string; state?: string; avatarUrl?: string }) =>
    api.patch('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.post('/auth/change-password', data),
};

// ── Reports ──────────────────────────────────────────────────
export const reportsApi = {
  submit: (data: FormData | Record<string, any>) => {
    if (data instanceof FormData) {
      return api.post('/reports', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/reports', data);
  },
  list: (params?: Record<string, any>) =>
    api.get('/reports', { params }),
  getMyReports: () =>
    api.get('/reports/my'),
  getReport: (id: string) =>
    api.get(`/reports/${id}`),
};

// ── Notifications ─────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ── Incidents ────────────────────────────────────────────────
export const incidentsApi = {
  list: (params?: Record<string, any>) =>
    api.get('/incidents', { params }),
  get: (id: string) =>
    api.get(`/incidents/${id}`),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/incidents/${id}`, data),
};

// ── Resources ────────────────────────────────────────────────
export const resourcesApi = {
  list: (params?: Record<string, any>) =>
    api.get('/resources', { params }),
  create: (data: Record<string, any>) =>
    api.post('/resources', data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/resources/${id}`, data),
};

// ── Alerts ───────────────────────────────────────────────────
export const alertsApi = {
  list: (params?: Record<string, any>) =>
    api.get('/alerts', { params }),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/alerts/${id}`, data),
};

// ── Assignments ──────────────────────────────────────────────
export const assignmentsApi = {
  create: (data: { incidentId: string; resourceId: string; eta?: number; notes?: string }) =>
    api.post('/assignments', data),
  update: (id: string, data: Record<string, any>) =>
    api.patch(`/assignments/${id}`, data),
};

// ── Dashboard ────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  citizenStats: () => api.get('/dashboard/citizen-stats'),
  analytics: (days?: number) => api.get('/dashboard/analytics', { params: { days } }),
};

// ── AI ───────────────────────────────────────────────────────
export const aiApi = {
  analyzeReport: (text: string) =>
    api.post('/ai/analyze-report', { text }),
  calculatePriority: (data: Record<string, any>) =>
    api.post('/ai/calculate-priority', data),
  findDuplicates: (data: Record<string, any>) =>
    api.post('/ai/find-duplicates', data),
  recommendResource: (data: Record<string, any>) =>
    api.post('/ai/recommend-resource', data),
};

export default api;
