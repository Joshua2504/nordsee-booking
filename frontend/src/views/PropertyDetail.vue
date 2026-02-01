<template>
  <div class="property-detail">
    <div class="container">
      <LoadingSpinner v-if="loading" :message="$t('common.loading')" />
      <div v-else>
        <h1>{{ $t('property.title') }}</h1>
        <p>Property details will be displayed here.</p>
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
.property-detail {
  padding: 40px 0;
}
</style>
