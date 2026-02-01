<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/common/Navbar.vue';
import Footer from '@/components/common/Footer.vue';

const authStore = useAuthStore();

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initializeAuth();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f7f7f7;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px; /* Account for fixed navbar */
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
}
</style>
