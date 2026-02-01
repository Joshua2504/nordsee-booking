import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    
    // Add language header
    const locale = localStorage.getItem('locale') || 'de';
    config.headers['Accept-Language'] = locale;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        const authStore = useAuthStore();
        authStore.logout();
        router.push({ name: 'login' });
      }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        router.push({ name: 'home' });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
