import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Will be proxied to Laravel backend
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'Terjadi kesalahan';
      console.error('API Error:', message, error.response.data);
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
