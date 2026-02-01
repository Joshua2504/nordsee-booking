<template>
  <div class="search-results">
    <div class="container">
      <LoadingSpinner v-if="loading" :message="$t('common.loading')" />
      <div v-else>
        <h1>{{ $t('search.results') }}</h1>
        <p>Showing results for your search</p>
        <div class="no-results">
          <p>{{ $t('search.no_results') }}</p>
          <p>This page will be fully implemented in the next phase.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const loading = ref(false);
</script>

<style scoped>
.search-results {
  padding: 40px 0;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}
</style>
