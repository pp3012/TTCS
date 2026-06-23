import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ───────────────────────────────────────────────
export const authApi = {
  register: (data: { user_name: string; email: string; password: string; full_name?: string }) =>
    api.post('/auth/register', data),
  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, password }),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (old_password: string, new_password: string) =>
    api.put('/auth/change-password', { old_password, new_password }),
};

// ─── Subjects ────────────────────────────────────────────
export const subjectApi = {
  getAll: () => api.get('/subjects'),
  getById: (id: number) => api.get(`/subjects/${id}`),
  getDifficultyLevels: () => api.get('/subjects/difficulty-levels'),
  getQuestionTypes: () => api.get('/subjects/question-types'),
  create: (data: object) => api.post('/subjects', data),
  update: (id: number, data: object) => api.put(`/subjects/${id}`, data),
  delete: (id: number) => api.delete(`/subjects/${id}`),
  addChapter: (subject_id: number, chapter_name: string) => api.post(`/subjects/${subject_id}/chapters`, { chapter_name }),
  updateChapter: (subject_id: number, chapter_id: number, chapter_name: string) => api.put(`/subjects/${subject_id}/chapters/${chapter_id}`, { chapter_name }),
};

// ─── Questions ───────────────────────────────────────────
export const questionApi = {
  getBySubject: (subjectId: number, params?: object) =>
    api.get(`/questions/subject/${subjectId}`, { params }),
  getById: (id: number) => api.get(`/questions/${id}`),
  create: (data: object) => api.post('/questions', data),
  update: (id: number, data: object) => api.put(`/questions/${id}`, data),
  delete: (id: number) => api.delete(`/questions/${id}`),
  importExcel: (file: File, subject_id: number) => {
    const form = new FormData();
    form.append('file', file);
    form.append('subject_id', String(subject_id));
    return api.post('/questions/import/excel', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  downloadTemplate: () => api.get('/questions/import/template', { responseType: 'blob' }),
};

// ─── Practice ────────────────────────────────────────────
export const practiceApi = {
  createFree: (subject_id: number, total_questions: number, time_per_question: number, chapter_id?: number) =>
    api.post('/practice/free', { subject_id, total_questions, time_per_question, chapter_id }),
  createPersonalized: (subject_id: number) =>
    api.post('/practice/personalized', { subject_id }),
  getQuestions: (sessionId: number) => api.get(`/practice/${sessionId}/questions`),
  submit: (sessionId: number, answers: { question_id: number; user_ans: string | null }[]) =>
    api.post(`/practice/${sessionId}/submit`, { answers }),
  getResult: (sessionId: number) => api.get(`/practice/${sessionId}/result`),
  getHistory: (params?: object) => api.get('/practice/history/me', { params }),
  getStats: (subject_id?: number) =>
    api.get('/practice/stats/me', { params: subject_id ? { subject_id } : {} }),
};

// ─── Admin ───────────────────────────────────────────────
export const adminApi = {
  getUsers: (params?: object) => api.get('/admin/users', { params }),
  getUserById: (id: number) => api.get(`/admin/users/${id}`),
  updateUser: (id: number, data: object) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getSubjectStats: () => api.get('/admin/stats/subjects'),
  getUserStats: (params: object) => api.get('/admin/stats/users', { params }),
};
