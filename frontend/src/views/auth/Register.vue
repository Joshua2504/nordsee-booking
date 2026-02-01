<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-card card">
        <h1>{{ $t('auth.register_title') }}</h1>
        
        <form @submit.prevent="handleRegister">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ $t('auth.first_name') }}</label>
              <input 
                v-model="form.firstName" 
                type="text" 
                required 
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('auth.last_name') }}</label>
              <input 
                v-model="form.lastName" 
                type="text" 
                required 
                class="form-input"
              >
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ $t('auth.email') }}</label>
            <input 
              v-model="form.email" 
              type="email" 
              required 
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label class="form-label">{{ $t('auth.phone') }}</label>
            <input 
              v-model="form.phone" 
              type="tel" 
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label class="form-label">{{ $t('auth.password') }}</label>
            <input 
              v-model="form.password" 
              type="password" 
              required 
              minlength="6"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label class="form-label">{{ $t('auth.role') }}</label>
            <select v-model="form.role" required class="form-input">
              <option value="guest">{{ $t('auth.role_guest') }}</option>
              <option value="host">{{ $t('auth.role_host') }}</option>
              <option value="both">{{ $t('auth.role_both') }}</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary full-width" :disabled="loading">
            {{ loading ? $t('common.loading') : $t('auth.register_button') }}
          </button>
        </form>

        <p class="auth-link">
          {{ $t('auth.have_account') }}
          <RouterLink to="/login">{{ $t('auth.login_link') }}</RouterLink>
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
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'guest'
});

const loading = ref(false);

const handleRegister = async () => {
  loading.value = true;
  
  try {
    const response = await api.post('/auth/register', {
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
      role: form.value.role
    });
    
    authStore.setAuth(response.data.user, response.data.token);
    toast.success('Registration successful!');
    router.push('/');
  } catch (error) {
    toast.error(error.response?.data?.error?.message || 'Registration failed');
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
  max-width: 500px;
  margin: 0 auto;
  padding: 40px;
}

.auth-card h1 {
  margin-bottom: 32px;
  text-align: center;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
