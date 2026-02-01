<template>
  <div class="create-property-page">
    <div class="page-header">
      <h1>{{ $t('property.createNew') }}</h1>
      <p>{{ $t('property.createDescription') }}</p>
    </div>

    <PropertyForm
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import PropertyForm from '@/components/property/PropertyForm.vue';
import propertyService from '@/services/propertyService';

const router = useRouter();
const toast = useToast();

const handleSubmit = async (formData) => {
  try {
    const response = await propertyService.createProperty(formData);
    
    toast.success('Property created successfully!');
    
    // Redirect to host dashboard
    router.push({ name: 'HostDashboard' });
  } catch (error) {
    console.error('Error creating property:', error);
    toast.error(error.response?.data?.message || 'Failed to create property');
  }
};

const handleCancel = () => {
  router.push({ name: 'HostDashboard' });
};
</script>

<style scoped>
.create-property-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .create-property-page {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }
}
</style>
