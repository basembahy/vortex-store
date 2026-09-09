import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vortex_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (localStorage.getItem('vortex_token')) {
        console.warn('Session expired. Logging out.');
        localStorage.removeItem('vortex_token');
        localStorage.removeItem('vortex_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
