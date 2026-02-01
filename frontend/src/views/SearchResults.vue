<template>
  <div class="search-results">
    <div class="container">
      <LoadingSpinner v-if="loading" :message="$t('common.loading')" />
      
      <div v-else>
        <!-- Search Filters -->
        <div class="search-header">
          <h1>{{ $t('search.results') }}</h1>
          <p v-if="properties.length > 0">{{ properties.length }} {{ $t('search.propertiesFound') }}</p>
        </div>

        <!-- Properties Grid -->
        <div v-if="properties.length > 0" class="properties-grid">
          <div v-for="property in properties" :key="property.id" class="property-card">
            <div class="property-image">
              <img
                v-if="property.primary_image"
                :src="property.primary_image.medium_path"
                :alt="property.title"
                loading="lazy"
              />
              <div v-else class="no-image">
                <span>📷</span>
              </div>
            </div>

            <div class="property-content">
              <div class="property-header">
                <h3>{{ property.title }}</h3>
                <div class="property-price">
                  €{{ property.base_price }}
                  <span class="price-period">/ {{ $t('property.night') }}</span>
                </div>
              </div>

              <p class="property-location">📍 {{ property.city }}</p>
              
              <div class="property-details">
                <span>👥 {{ property.guest_capacity }} {{ $t('property.guests_capacity') }}</span>
                <span>🛏️ {{ property.bedrooms }} {{ $t('property.bedrooms') }}</span>
                <span>🛁 {{ property.bathrooms }} {{ $t('property.bathrooms') }}</span>
              </div>

              <p class="property-description">{{ truncateText(property.description, 120) }}</p>

              <RouterLink :to="`/properties/${property.id}`" class="btn btn-primary">
                {{ $t('common.view') }}
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else class="no-results">
          <div class="no-results-icon">🔍</div>
          <h2>{{ $t('search.no_results') }}</h2>
          <p>{{ $t('search.noResultsDescription') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import propertyService from '@/services/propertyService';

const loading = ref(true);
const properties = ref([]);
const toast = useToast();

const loadProperties = async () => {
  loading.value = true;
  try {
    const response = await propertyService.searchProperties({
      status: 'published'
    });
    properties.value = response.properties;
  } catch (error) {
    console.error('Error loading properties:', error);
    toast.error('Failed to load properties');
  } finally {
    loading.value = false;
  }
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

onMounted(() => {
  loadProperties();
});
</script>

<style scoped>
.search-results {
  padding: 2rem 1rem;
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 2rem;
}

.search-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.search-header p {
  color: #666;
  font-size: 1.1rem;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
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
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #e0e0e0;
  position: relative;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.no-image span {
  font-size: 4rem;
}

.property-content {
  padding: 1.5rem;
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.property-header h3 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  margin-right: 1rem;
}

.property-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #3498db;
  white-space: nowrap;
}

.price-period {
  font-size: 0.875rem;
  font-weight: normal;
  color: #666;
}

.property-location {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.property-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.property-details span {
  font-size: 0.9rem;
  color: #666;
}

.property-description {
  color: #555;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s;
  width: 100%;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-results h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.no-results p {
  color: #666;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .properties-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .search-header h1 {
    font-size: 1.5rem;
  }

  .property-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .property-price {
    align-self: flex-start;
  }
}
</style>
