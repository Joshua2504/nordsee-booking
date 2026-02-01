<template>
  <div class="verify-email-page">
    <div class="container">
      <div class="verify-card card">
        <div v-if="loading" class="text-center">
          <LoadingSpinner message="Verifying your email..." />
        </div>

        <div v-else-if="success" class="success-message">
          <div class="icon">✅</div>
          <h1>{{ $t('auth.email_verified') }}</h1>
          <p>Your email has been successfully verified. You can now access all features.</p>
          <RouterLink to="/" class="btn btn-primary">
            {{ $t('common.continue') }}
          </RouterLink>
        </div>

        <div v-else class="error-message">
          <div class="icon">❌</div>
          <h1>Verification Failed</h1>
          <p>{{ errorMessage }}</p>
          <RouterLink to="/login" class="btn btn-outline">
            {{ $t('nav.login') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const route = useRoute();
const toast = useToast();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  const token = route.query.token;

  if (!token) {
    loading.value = false;
    errorMessage.value = 'No verification token provided.';
    return;
  }

  try {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    success.value = true;
    toast.success(response.data.message || 'Email verified successfully!');
  } catch (error) {
    errorMessage.value = error.response?.data?.error?.message || 'Verification failed. The link may have expired.';
    toast.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.verify-email-page {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  padding: 40px 0;
}

.verify-card {
  max-width: 500px;
  margin: 0 auto;
  padding: 60px 40px;
  text-align: center;
}

.icon {
  font-size: 80px;
  margin-bottom: 24px;
}

h1 {
  margin-bottom: 16px;
  color: var(--text-dark);
}

p {
  color: var(--text-light);
  margin-bottom: 32px;
  line-height: 1.6;
}

.success-message .icon {
  color: var(--success-color);
}

.error-message .icon {
  color: var(--danger-color);
}
</style>
