<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-card card">
        <h1>{{ $t('auth.login_title') }}</h1>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">{{ $t('auth.email') }}</label>
            <input 
              v-model="form.email" 
              type="email" 
              required 
              class="form-input"
              placeholder="mail@example.com"
            >
          </div>

          <div class="form-group">
            <label class="form-label">{{ $t('auth.password') }}</label>
            <input 
              v-model="form.password" 
              type="password" 
              required 
              class="form-input"
              placeholder="••••••••"
            >
          </div>

          <button type="submit" class="btn btn-primary full-width" :disabled="loading">
            {{ loading ? $t('common.loading') : $t('auth.login_button') }}
          </button>
        </form>

        <p class="auth-link">
          {{ $t('auth.no_account') }}
          <RouterLink to="/register">{{ $t('auth.register_link') }}</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import api from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = ref({
  email: '',
  password: ''
});

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  
  try {
    const response = await api.post('/auth/login', form.value);
    authStore.setAuth(response.data.user, response.data.token);
    toast.success('Login successful!');
    
    // Redirect to intended page or home
    const redirect = router.currentRoute.value.query.redirect || '/';
    router.push(redirect);
  } catch (error) {
    toast.error(error.response?.data?.error?.message || 'Login failed');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  padding: 60px 0;
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
}

.auth-card {
  max-width: 450px;
  margin: 0 auto;
  padding: 40px;
}

.auth-card h1 {
  margin-bottom: 32px;
  text-align: center;
}

.full-width {
  width: 100%;
  margin-top: 8px;
}

.auth-link {
  text-align: center;
  margin-top: 24px;
  color: var(--text-light);
}

.auth-link a {
  color: var(--primary-color);
  font-weight: 600;
}
</style>
