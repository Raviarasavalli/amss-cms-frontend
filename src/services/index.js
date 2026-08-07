import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const memberService = {
  getAll: (params) => api.get('/members', { params }),
  getAllList: () => api.get('/members/all'),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

export const contributionService = {
  getAll: (params) => api.get('/contributions', { params }),
  getById: (id) => api.get(`/contributions/${id}`),
  getByMember: (memberId) => api.get(`/contributions/member/${memberId}`),
  create: (data) => api.post('/contributions', data),
  update: (id, data) => api.put(`/contributions/${id}`, data),
  delete: (id) => api.delete(`/contributions/${id}`),
};

export const dashboardService = {
  getData: (year) => api.get('/dashboard', { params: { year } }),
};

export const reportService = {
  getAnnual: (year) => api.get('/reports/annual', { params: { year } }),
  getMember: (id) => api.get(`/reports/member/${id}`),
  getMonthly: (year, month) => api.get('/reports/monthly', { params: { year, month } }),
  downloadPDF: (year) => api.get('/reports/annual/pdf', {
    params: { year },
    responseType: 'blob',
  }),
  downloadExcel: (year) => api.get('/reports/annual/excel', {
    params: { year },
    responseType: 'blob',
  }),
};

export const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
