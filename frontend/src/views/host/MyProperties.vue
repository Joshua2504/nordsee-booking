<template>
  <div class="my-properties-page">
    <div class="page-header">
      <h1>{{ $t('property.myProperties') }}</h1>
      <RouterLink to="/host/properties/create" class="btn btn-primary">
        <span class="icon">+</span>
        {{ $t('nav.create_property') }}
      </RouterLink>
    </div>

    <div v-if="loading" class="loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="properties.length === 0" class="empty-state">
      <div class="empty-icon">🏠</div>
      <h2>{{ $t('property.noProperties') }}</h2>
      <p>{{ $t('property.noPropertiesDescription') }}</p>
      <RouterLink to="/host/properties/create" class="btn btn-primary">
        {{ $t('property.createFirst') }}
      </RouterLink>
    </div>

    <div v-else class="properties-grid">
      <div v-for="property in properties" :key="property.id" class="property-card">
        <div class="property-image">
          <img
            v-if="property.primary_image"
            :src="property.primary_image.thumbnail_path"
            :alt="property.title"
            loading="lazy"
          />
          <div v-else class="no-image">
            <span>📷</span>
            <p>{{ $t('property.noImage') }}</p>
          </div>
          <span class="status-badge" :class="`status-${property.status}`">
            {{ $t(`propertyStatus.${property.status}`) }}
          </span>
        </div>

        <div class="property-info">
          <h3>{{ property.title }}</h3>
          <p class="property-location">
            📍 {{ property.city }}
          </p>
          <p class="property-details">
            {{ property.guest_capacity }} {{ $t('property.guests_capacity') }} • 
            {{ property.bedrooms }} {{ $t('property.bedrooms') }} • 
            {{ property.beds }} {{ $t('property.beds') }}
          </p>
          <p class="property-price">
            {{ $t('common.from') }} <strong>€{{ Math.round(property.min_price || property.base_price) }}</strong> / {{ $t('property.night') }}
          </p>
        </div>

        <div class="property-actions">
          <RouterLink 
            :to="`/host/properties/${property.id}/edit`" 
            class="btn btn-outline btn-sm"
          >
            {{ $t('common.edit') }}
          </RouterLink>
          <button 
            class="btn btn-info btn-sm" 
            @click="openAvailabilityModal(property)"
          >
            📅 {{ $t('availability.manage') }}
          </button>
          <button 
            class="btn btn-outline btn-sm" 
            @click="toggleStatus(property)"
          >
            {{ property.status === 'published' ? $t('property.unpublish') : $t('property.publish') }}
          </button>
          <button 
            class="btn btn-danger btn-sm" 
            @click="confirmDelete(property)"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Availability Modal -->
    <div v-if="showAvailabilityModal" class="modal-overlay" @click="closeAvailabilityModal">
      <div class="modal modal-large" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('availability.title') }} - {{ selectedProperty?.title }}</h3>
          <button class="close-btn" @click="closeAvailabilityModal">×</button>
        </div>
        <div class="modal-body">
          <AvailabilityCalendar 
            v-if="selectedProperty" 
            :property-id="selectedProperty.id" 
          />
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal" @click.stop>
        <h3>{{ $t('property.deleteConfirmTitle') }}</h3>
        <p>{{ $t('property.deleteConfirmMessage', { title: propertyToDelete?.title }) }}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">
            {{ $t('common.cancel') }}
          </button>
          <button class="btn btn-danger" @click="deleteProperty">
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import AvailabilityCalendar from '@/components/property/AvailabilityCalendar.vue';
import propertyService from '@/services/propertyService';

const toast = useToast();

const loading = ref(false);
const error = ref(null);
const properties = ref([]);
const showDeleteModal = ref(false);
const propertyToDelete = ref(null);
const showAvailabilityModal = ref(false);
const selectedProperty = ref(null);

onMounted(() => {
  loadProperties();
});

const loadProperties = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await propertyService.getMyProperties();
    properties.value = response.properties;
  } catch (err) {
    console.error('Error loading properties:', err);
    error.value = err.response?.data?.message || 'Failed to load properties';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const toggleStatus = async (property) => {
  try {
    const newStatus = property.status === 'published' ? 'unpublished' : 'published';
    await propertyService.updateProperty(property.id, { status: newStatus });
    
    property.status = newStatus;
    toast.success(`Property ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
  } catch (err) {
    console.error('Error updating status:', err);
    toast.error(err.response?.data?.message || 'Failed to update status');
  }
};

const confirmDelete = (property) => {
  propertyToDelete.value = property;
  showDeleteModal.value = true;
};

const openAvailabilityModal = (property) => {
  selectedProperty.value = property;
  showAvailabilityModal.value = true;
};

const closeAvailabilityModal = () => {
  showAvailabilityModal.value = false;
  selectedProperty.value = null;
};

const deleteProperty = async () => {
  try {
    await propertyService.deleteProperty(propertyToDelete.value.id);
    
    properties.value = properties.value.filter(p => p.id !== propertyToDelete.value.id);
    toast.success('Property deleted successfully!');
    showDeleteModal.value = false;
    propertyToDelete.value = null;
  } catch (err) {
    console.error('Error deleting property:', err);
    toast.error(err.response?.data?.message || 'Failed to delete property');
  }
};
</script>

<style scoped>
.my-properties-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0;
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
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.property-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.property-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f0f0f0;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.no-image span {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-published {
  color: #27ae60;
}

.status-draft {
  color: #95a5a6;
}

.status-unpublished {
  color: #e67e22;
}

.property-info {
  padding: 1.5rem;
}

.property-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.property-location {
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.property-details {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.property-price {
  margin: 0;
  font-size: 1.1rem;
}

.property-price strong {
  color: #2c3e50;
}

.property-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-outline {
  background: transparent;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
}

.btn-danger {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.btn-danger:hover {
  background: #e74c3c;
  color: white;
}

.btn-info {
  background: transparent;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn-info:hover {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.icon {
  font-size: 1.2rem;
  font-weight: bold;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
}

.modal-large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  max-height: 70vh;
  overflow-y: auto;
}

.modal h3 {
  margin-top: 0;
  color: #2c3e50;
}

.modal p {
  color: #666;
  margin-bottom: 2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .my-properties-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .properties-grid {
    grid-template-columns: 1fr;
  }

  .property-actions {
    flex-wrap: wrap;
  }
}
</style>
