import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchResults.vue')
  },
  {
    path: '/properties/:id',
    name: 'property-detail',
    component: () => import('@/views/PropertyDetail.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('@/views/auth/VerifyEmail.vue')
  },
  {
    path: '/host/dashboard',
    name: 'host-dashboard',
    component: () => import('@/views/host/HostDashboard.vue'),
    meta: { requiresAuth: true, role: 'host' }
  },
  {
    path: '/host/properties',
    name: 'my-properties',
    component: () => import('@/views/host/MyProperties.vue'),
    meta: { requiresAuth: true, role: 'host' }
  },
  {
    path: '/host/properties/create',
    name: 'create-property',
    component: () => import('@/views/host/CreateProperty.vue'),
    meta: { requiresAuth: true, role: 'host' }
  },
  {
    path: '/host/properties/:id/edit',
    name: 'edit-property',
    component: () => import('@/views/host/EditProperty.vue'),
    meta: { requiresAuth: true, role: 'host' }
  },
  {
    path: '/host/bookings',
    name: 'host-bookings',
    component: () => import('@/views/host/HostBookings.vue'),
    meta: { requiresAuth: true, role: 'host' }
  },
  {
    path: '/guest/dashboard',
    name: 'guest-dashboard',
    component: () => import('@/views/guest/GuestDashboard.vue'),
    meta: { requiresAuth: true, role: 'guest' }
  },
  {
    path: '/guest/bookings',
    name: 'my-bookings',
    component: () => import('@/views/guest/MyBookings.vue'),
    meta: { requiresAuth: true, role: 'guest' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isGuest = to.matched.some(record => record.meta.guest);
  const requiredRole = to.meta.role;

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (isGuest && authStore.isAuthenticated) {
    next({ name: 'home' });
  } else if (requiredRole && !authStore.hasRole(requiredRole)) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
