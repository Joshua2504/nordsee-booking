<template>
  <div class="property-detail">
    <LoadingSpinner v-if="loading" :message="$t('common.loading')" />
    
    <div v-else-if="property" class="property-container">
      <!-- Image Gallery -->
      <div class="image-gallery">
        <div v-if="property.images && property.images.length > 0" class="gallery-grid">
          <div class="main-image">
            <img 
              :src="currentImage.medium_path || currentImage.file_path" 
              :alt="property.title"
            />
          </div>
          <div v-if="property.images.length > 1" class="thumbnail-grid">
            <div
              v-for="(image, index) in property.images.slice(0, 4)"
              :key="image.id"
              class="thumbnail"
              :class="{ active: currentImage.id === image.id }"
              @click="currentImage = image"
            >
              <img :src="image.thumbnail_path" :alt="`Image ${index + 1}`" />
            </div>
          </div>
        </div>
        <div v-else class="no-image-placeholder">
          <span>📷</span>
          <p>{{ $t('property.noImage') }}</p>
        </div>
      </div>

      <!-- Property Info -->
      <div class="property-content">
        <div class="property-main">
          <!-- Header -->
          <div class="property-header">
            <div>
              <h1>{{ property.title }}</h1>
              <p class="property-location">📍 {{ property.address }}, {{ property.city }} {{ property.postal_code }}</p>
            </div>
            <div class="property-price">
              <span class="price-amount">{{ $t('common.from') }} €{{ Math.round(property.min_price || property.base_price) }}</span>
              <span class="price-period">/ {{ $t('property.night') }}</span>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="property-stats">
            <div class="stat-item">
              <span class="stat-icon">👥</span>
              <span>{{ property.guest_capacity }} {{ $t('property.guests_capacity') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🛏️</span>
              <span>{{ property.bedrooms }} {{ $t('property.bedrooms') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🛌</span>
              <span>{{ property.beds }} {{ $t('property.beds') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🛁</span>
              <span>{{ property.bathrooms }} {{ $t('property.bathrooms') }}</span>
            </div>
          </div>

          <hr />

          <!-- Description -->
          <div class="property-section">
            <h2>{{ $t('property.description') }}</h2>
            <p class="property-description">{{ property.description }}</p>
          </div>

          <hr />

          <!-- Amenities -->
          <div v-if="property.amenities && property.amenities.length > 0" class="property-section">
            <h2>{{ $t('property.amenities') }}</h2>
            <div class="amenities-grid">
              <div v-for="amenity in property.amenities" :key="amenity.id" class="amenity-item">
                <span class="amenity-icon">{{ amenity.icon }}</span>
                <span>{{ $t(amenity.name) }}</span>
              </div>
            </div>
          </div>

          <hr />

          <!-- Pricing Breakdown -->
          <div class="property-section">
            <h2>{{ $t('property.pricingDetails') }}</h2>
            <div class="pricing-breakdown">
              <div class="pricing-row">
                <span>{{ $t('property.price_per_night') }}</span>
                <span>{{ $t('common.from') }} €{{ Math.round(property.min_price || property.base_price) }}</span>
              </div>
              <div v-if="property.cleaning_fee" class="pricing-row">
                <span>{{ $t('property.cleaning_fee') }}</span>
                <span>€{{ property.cleaning_fee }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Sidebar -->
        <div class="booking-sidebar">
          <BookingForm v-if="isAuthenticated" :property="property" />
          
          <div v-else class="booking-card">
            <div class="booking-price">
              <span class="price">{{ $t('common.from') }} €{{ Math.round(property.min_price || property.base_price) }}</span>
              <span class="period">/ {{ $t('property.night') }}</span>
            </div>

            <div class="booking-notice">
              <p>{{ $t('booking.loginRequired') }}</p>
            </div>

            <RouterLink to="/login" class="btn btn-primary btn-block">
              {{ $t('auth.login_button') }}
            </RouterLink>

            <p class="booking-info">{{ $t('property.noChargeYet') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-message">
      <h2>{{ $t('property.notFound') }}</h2>
      <p>{{ $t('property.notFoundDescription') }}</p>
      <RouterLink to="/search" class="btn btn-primary">
        {{ $t('search.title') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BookingForm from '@/components/booking/BookingForm.vue';
import propertyService from '@/services/propertyService';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const { isAuthenticated } = storeToRefs(authStore);

const loading = ref(true);
const property = ref(null);
const currentImage = ref(null);

const loadProperty = async () => {
  loading.value = true;
  try {
    const propertyId = route.params.id;
    const response = await propertyService.getProperty(propertyId);
    property.value = response.property;
    
    // Set first image as current
    if (property.value.images && property.value.images.length > 0) {
      currentImage.value = property.value.images[0];
    }
  } catch (error) {
    console.error('Error loading property:', error);
    toast.error('Failed to load property details');
    property.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProperty();
});
</script>

<style scoped>
.property-detail {
  min-height: 100vh;
  background: #f8f9fa;
}

.property-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.image-gallery {
  margin-bottom: 2rem;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gallery-grid {
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem;
}

.main-image {
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 8px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.thumbnail {
  height: 100px;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s;
}

.thumbnail:hover {
  border-color: #3498db;
}

.thumbnail.active {
  border-color: #3498db;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-placeholder {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.no-image-placeholder span {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.property-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

.property-main {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.property-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.property-location {
  color: #666;
  font-size: 1.1rem;
}

.property-price {
  text-align: right;
}

.price-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  display: block;
}

.price-period {
  color: #666;
  font-size: 1rem;
}

.property-stats {
  display: flex;
  gap: 2rem;
  padding: 1.5rem 0;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: #2c3e50;
}

.stat-icon {
  font-size: 1.5rem;
}

hr {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 2rem 0;
}

.property-section {
  margin-bottom: 2rem;
}

.property-section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.property-description {
  line-height: 1.8;
  color: #555;
  font-size: 1.05rem;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 1rem;
}

.amenity-icon {
  font-size: 1.5rem;
}

.pricing-breakdown {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.pricing-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 1.1rem;
}

.pricing-row:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}

.booking-sidebar {
  position: sticky;
  top: 2rem;
}

.booking-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.booking-price {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.booking-price .price {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

.booking-price .period {
  color: #666;
  font-size: 1rem;
  margin-left: 0.5rem;
}

.booking-notice {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #e8f4fd;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #2c3e50;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
  display: block;
}

.booking-info {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.error-message {
  max-width: 600px;
  margin: 4rem auto;
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-message h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.error-message p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

@media (max-width: 1024px) {
  .property-content {
    grid-template-columns: 1fr;
  }

  .booking-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .main-image {
    height: 300px;
  }

  .thumbnail-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .property-header {
    flex-direction: column;
    gap: 1rem;
  }

  .property-price {
    text-align: left;
  }

  .property-stats {
    grid-template-columns: 1fr 1fr;
  }

  .amenities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
