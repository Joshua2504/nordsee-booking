import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const isAuthenticated = computed(() => !!token.value);

  function initializeAuth() {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  }

  function setAuth(userData, authToken) {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function hasRole(role) {
    if (!user.value) return false;
    return user.value.role === role || user.value.role === 'both';
  }

  return {
    user,
    token,
    isAuthenticated,
    initializeAuth,
    setAuth,
    logout,
    hasRole
  };
});
