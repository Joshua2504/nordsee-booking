<template>
  <div class="image-uploader">
    <h4>{{ $t('propertyForm.images') }}</h4>
    
    <!-- Upload Area -->
    <div 
      class="upload-zone"
      :class="{ 'dragging': isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="upload-icon">📷</div>
      <p class="upload-text">{{ $t('propertyForm.uploadImages') }}</p>
      <p class="upload-hint">{{ $t('propertyForm.uploadHint') }}</p>
    </div>

    <!-- Uploading Progress -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p>{{ $t('propertyForm.uploading') }}... {{ uploadProgress }}%</p>
    </div>

    <!-- Images Grid -->
    <div v-if="images.length > 0" class="images-grid">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="image-item"
        :class="{ 'is-primary': image.is_primary }"
      >
        <img 
          :src="`/uploads/${image.medium_path || image.file_path}`" 
          :alt="image.alt_text || 'Property image'"
        />
        <div class="image-overlay">
          <button
            type="button"
            class="btn-icon"
            :title="$t('propertyForm.setPrimary')"
            @click="setPrimary(image)"
          >
            ⭐
          </button>
          <button
            type="button"
            class="btn-icon btn-danger"
            :title="$t('common.delete')"
            @click="deleteImage(image)"
          >
            🗑️
          </button>
        </div>
        <div v-if="image.is_primary" class="primary-badge">
          {{ $t('propertyForm.primaryImage') }}
        </div>
      </div>
    </div>

    <p v-if="images.length === 0" class="no-images">
      {{ $t('propertyForm.noImages') }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import propertyService from '@/services/propertyService';

const props = defineProps({
  propertyId: {
    type: Number,
    required: true
  },
  initialImages: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:images']);

const toast = useToast();
const fileInput = ref(null);
const isDragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const images = ref([...props.initialImages]);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  uploadFiles(files);
};

const handleDrop = (event) => {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files);
  uploadFiles(files);
};

const uploadFiles = async (files) => {
  if (files.length === 0) return;

  // Validate files
  const validFiles = files.filter(file => {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image`);
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error(`${file.name} is too large (max 20MB)`);
      return false;
    }
    return true;
  });

  if (validFiles.length === 0) return;

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const formData = new FormData();
      formData.append('image', file);
      formData.append('display_order', images.value.length);
      
      // Set first image as primary if no images exist
      if (images.value.length === 0 && i === 0) {
        formData.append('is_primary', 'true');
      }

      const response = await propertyService.uploadImage(props.propertyId, formData);
      images.value.push(response.image);
      
      uploadProgress.value = Math.round(((i + 1) / validFiles.length) * 100);
    }

    emit('update:images', images.value);
    toast.success(`${validFiles.length} image(s) uploaded successfully!`);
  } catch (error) {
    console.error('Error uploading images:', error);
    toast.error(error.response?.data?.message || 'Failed to upload images');
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const setPrimary = async (image) => {
  try {
    await propertyService.setPrimaryImage(props.propertyId, image.id);
    
    // Update local state
    images.value.forEach(img => {
      img.is_primary = img.id === image.id;
    });
    
    emit('update:images', images.value);
    toast.success('Primary image updated!');
  } catch (error) {
    console.error('Error setting primary image:', error);
    toast.error(error.response?.data?.message || 'Failed to set primary image');
  }
};

const deleteImage = async (image) => {
  if (!confirm('Are you sure you want to delete this image?')) return;

  try {
    await propertyService.deleteImage(props.propertyId, image.id);
    
    images.value = images.value.filter(img => img.id !== image.id);
    emit('update:images', images.value);
    
    toast.success('Image deleted successfully!');
  } catch (error) {
    console.error('Error deleting image:', error);
    toast.error(error.response?.data?.message || 'Failed to delete image');
  }
};
</script>

<style scoped>
.image-uploader {
  margin-top: 1.5rem;
}

.image-uploader h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.upload-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
}

.upload-zone:hover,
.upload-zone.dragging {
  border-color: #3498db;
  background: #ebf5fb;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.9rem;
  color: #666;
}

.upload-progress {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.image-item {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.image-item.is-primary {
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.2);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  transform: scale(1.1);
  background: white;
}

.btn-icon.btn-danger:hover {
  background: #e74c3c;
}

.primary-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(243, 156, 18, 0.95);
  color: white;
  padding: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.no-images {
  text-align: center;
  color: #999;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>
