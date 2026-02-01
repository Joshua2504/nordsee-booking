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

    <div v-if="showImageUpload && createdPropertyId" class="image-upload-section">
      <div class="success-message">
        <span class="success-icon">✅</span>
        <h2>{{ $t('property.propertyCreated') }}</h2>
        <p>{{ $t('property.propertyCreatedDescription') }}</p>
      </div>
      
      <h3>{{ $t('propertyForm.addImages') }}</h3>
      <p>{{ $t('propertyForm.addImagesDescription') }}</p>
      <ImageUploader
        :property-id="createdPropertyId"
        :initial-images="[]"
      />
      <div class="form-actions">
        <RouterLink to="/host/properties" class="btn btn-outline">
          {{ $t('property.viewMyProperties') }}
        </RouterLink>
        <RouterLink to="/host/properties/create" class="btn btn-secondary" @click="resetForm">
          {{ $t('property.createAnother') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import PropertyForm from '@/components/property/PropertyForm.vue';
import ImageUploader from '@/components/property/ImageUploader.vue';
import propertyService from '@/services/propertyService';

const router = useRouter();
const toast = useToast();

const showImageUpload = ref(false);
const createdPropertyId = ref(null);

const resetForm = () => {
  showImageUpload.value = false;
  createdPropertyId.value = null;
};

const handleSubmit = async (formData) => {
  try {
    const response = await propertyService.createProperty(formData);
    
    toast.success('Property created successfully! Add images or click Done to continue.');
    
    // Show image upload section instead of redirecting
    createdPropertyId.value = response.property.id;
    showImageUpload.value = true;
    
    // Scroll to image upload section
    setTimeout(() => {
      document.querySelector('.image-upload-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
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

.image-upload-section {
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.success-message {
  text-align: center;
  padding: 2rem;
  background: #d4edda;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.success-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.success-message h2 {
  color: #155724;
  margin-bottom: 0.5rem;
}

.success-message p {
  color: #155724;
}

.image-upload-section h3 {
  color: #2c3e50;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
}

.image-upload-section p {
  color: #666;
  margin-bottom: 1.5rem;
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-outline {
  background: white;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
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
