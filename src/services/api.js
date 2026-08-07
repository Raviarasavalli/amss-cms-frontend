import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://amss-cms-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('amss_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('amss_token');
      localStorage.removeItem('amss_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
