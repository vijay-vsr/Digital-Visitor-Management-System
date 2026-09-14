import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on a protected path, clear token
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register-visitor' && window.location.pathname !== '/kiosk') {
        localStorage.removeItem('vms_token');
        localStorage.removeItem('vms_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
