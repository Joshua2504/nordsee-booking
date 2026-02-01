<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <RouterLink to="/" class="navbar-brand">
          <span class="logo">🌊 {{ $t('app.title') }}</span>
        </RouterLink>

        <div class="navbar-links">
          <RouterLink to="/search" class="nav-link">
            {{ $t('nav.search') }}
          </RouterLink>

          <template v-if="authStore.isAuthenticated">
            <RouterLink 
              v-if="authStore.hasRole('host')" 
              to="/host/dashboard" 
              class="nav-link"
            >
              {{ $t('nav.host_dashboard') }}
            </RouterLink>

            <RouterLink 
              v-if="authStore.hasRole('guest')" 
              to="/guest/dashboard" 
              class="nav-link"
            >
              {{ $t('nav.guest_dashboard') }}
            </RouterLink>

            <div class="nav-dropdown">
              <button class="nav-link dropdown-trigger">
                {{ authStore.user?.first_name || 'User' }} ▾
              </button>
              <div class="dropdown-menu">
                <RouterLink to="/guest/bookings" class="dropdown-item">
                  {{ $t('nav.my_bookings') }}
                </RouterLink>
                <RouterLink 
                  v-if="authStore.hasRole('host')" 
                  to="/host/bookings" 
                  class="dropdown-item"
                >
                  {{ $t('nav.host_bookings') }}
                </RouterLink>
                <button @click="handleLogout" class="dropdown-item">
                  {{ $t('nav.logout') }}
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <RouterLink to="/login" class="nav-link">
              {{ $t('nav.login') }}
            </RouterLink>
            <RouterLink to="/register" class="btn btn-primary">
              {{ $t('nav.register') }}
            </RouterLink>
          </template>

          <div class="language-switcher">
            <button 
              @click="switchLanguage('de')" 
              :class="{ active: locale === 'de' }"
              class="lang-btn"
            >
              DE
            </button>
            <button 
              @click="switchLanguage('en')" 
              :class="{ active: locale === 'en' }"
              class="lang-btn"
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const router = useRouter();
const { locale } = useI18n();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

const switchLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem('locale', lang);
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--white);
  box-shadow: var(--shadow);
  z-index: 1000;
  height: 80px;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.navbar-brand {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: var(--text-dark);
  font-weight: 500;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  transition: var(--transition);
  background: none;
  border: none;
}

.nav-link:hover {
  background: var(--background-light);
}

.nav-link.router-link-active {
  color: var(--primary-color);
}

.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  cursor: pointer;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--white);
  box-shadow: var(--shadow);
  border-radius: var(--border-radius);
  min-width: 200px;
  margin-top: 8px;
}

.nav-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  border: none;
  background: none;
  color: var(--text-dark);
  transition: var(--transition);
}

.dropdown-item:hover {
  background: var(--background-light);
}

.language-switcher {
  display: flex;
  gap: 4px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 4px;
}

.lang-btn {
  padding: 6px 12px;
  border: none;
  background: none;
  border-radius: 4px;
  font-weight: 600;
  color: var(--text-light);
  transition: var(--transition);
}

.lang-btn.active {
  background: var(--primary-color);
  color: var(--white);
}

@media (max-width: 768px) {
  .navbar-links {
    gap: 10px;
  }

  .nav-link {
    padding: 6px 10px;
    font-size: 14px;
  }
}
</style>
