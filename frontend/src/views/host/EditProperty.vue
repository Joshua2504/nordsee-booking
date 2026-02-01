<template>
  <div class="edit-property-page">
    <div v-if="loading" class="loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else>
      <div class="page-header">
        <div>
          <h1>{{ $t('property.edit') }}</h1>
          <p class="subtitle">{{ property?.title }}</p>
        </div>
        <RouterLink to="/host/properties" class="btn btn-secondary">
          ← {{ $t('common.back') }}
        </RouterLink>
      </div>

      <!-- Image Upload Section -->
      <section class="form-section">
        <ImageUploader
          :property-id="propertyId"
          :initial-images="property?.images || []"
          @update:images="handleImagesUpdate"
        />
      </section>

      <!-- Property Form -->
      <PropertyForm
        :property="property"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import PropertyForm from '@/components/property/PropertyForm.vue';
import ImageUploader from '@/components/property/ImageUploader.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import propertyService from '@/services/propertyService';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const propertyId = computed(() => parseInt(route.params.id));
const loading = ref(false);
const error = ref(null);
const property = ref(null);

onMounted(() => {
  loadProperty();
});

const loadProperty = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await propertyService.getProperty(propertyId.value);
    property.value = response.property;
  } catch (err) {
    console.error('Error loading property:', err);
    error.value = err.response?.data?.message || 'Failed to load property';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async (formData) => {
  try {
    await propertyService.updateProperty(propertyId.value, formData);
    
    toast.success('Property updated successfully!');
    router.push({ name: 'my-properties' });
  } catch (error) {
    console.error('Error updating property:', error);
    toast.error(error.response?.data?.message || 'Failed to update property');
  }
};

const handleCancel = () => {
  router.push({ name: 'my-properties' });
};

const handleImagesUpdate = (images) => {
  if (property.value) {
    property.value.images = images;
  }
};
</script>

<style scoped>
.edit-property-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.error-message {
  padding: 2rem;
  background: #fee;
  color: #c33;
  border-radius: 8px;
  text-align: center;
  margin: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.form-section {
  background: white;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .edit-property-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
