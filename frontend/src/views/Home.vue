<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1>{{ $t('app.title') }}</h1>
        <p class="tagline">{{ $t('app.tagline') }}</p>
        
        <div class="search-box card">
          <div class="search-field">
            <label>{{ $t('search.location') }}</label>
            <input 
              v-model="searchForm.location" 
              type="text" 
              placeholder="z.B. Sylt, St. Peter-Ording"
              class="form-input"
            >
          </div>

          <div class="search-field">
            <label>{{ $t('search.check_in') }}</label>
            <input 
              v-model="searchForm.checkIn" 
              type="date" 
              class="form-input"
            >
          </div>

          <div class="search-field">
            <label>{{ $t('search.check_out') }}</label>
            <input 
              v-model="searchForm.checkOut" 
              type="date" 
              class="form-input"
            >
          </div>

          <div class="search-field">
            <label>{{ $t('search.guests') }}</label>
            <input 
              v-model.number="searchForm.guests" 
              type="number" 
              min="1" 
              class="form-input"
            >
          </div>

          <button @click="handleSearch" class="btn btn-primary search-btn">
            {{ $t('search.search_button') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Properties & Map Section -->
    <section class="properties-section">
      <LoadingSpinner v-if="loading" :message="$t('common.loading')" />
      
      <div v-else class="properties-map-container">
        <!-- Properties List -->
        <div class="properties-list">
          <div class="properties-header">
            <h2>{{ properties.length }} {{ $t('search.propertiesFound') }}</h2>
          </div>

          <!-- Filters -->
          <div class="filters-bar">
            <div class="filter-group">
              <select v-model="filters.city" class="filter-select">
                <option value="">Alle Städte</option>
                <option v-for="city in availableCities" :key="city" :value="city">{{ city }}</option>
              </select>
            </div>

            <div class="filter-group">
              <input 
                v-model.number="filters.minPrice" 
                type="number" 
                placeholder="Min €"
                class="filter-input"
              />
            </div>

            <div class="filter-group">
              <input 
                v-model.number="filters.maxPrice" 
                type="number" 
                placeholder="Max €"
                class="filter-input"
              />
            </div>

            <div class="filter-group">
              <select v-model.number="filters.guests" class="filter-select">
                <option :value="null">Gäste</option>
                <option v-for="n in 10" :key="n" :value="n">{{ n }}+ Gäste</option>
              </select>
            </div>

            <div class="filter-group">
              <select v-model.number="filters.bedrooms" class="filter-select">
                <option :value="null">Schlafzimmer</option>
                <option v-for="n in 5" :key="n" :value="n">{{ n }}+ Schlafzimmer</option>
              </select>
            </div>

            <button 
              v-if="filters.city || filters.minPrice || filters.maxPrice || filters.guests || filters.bedrooms"
              @click="resetFilters" 
              class="btn-clear-filters"
            >
              ✕ Filter zurücksetzen
            </button>
          </div>

          <div v-if="properties.length > 0" class="property-cards">
            <div 
              v-for="property in properties" 
              :key="property.id" 
              class="property-card"
              :class="{ selected: selectedProperty && selectedProperty.id === property.id }"
              @mouseenter="selectProperty(property)"
              @click="viewProperty(property.id)"
            >
              <div class="property-image">
                <img
                  v-if="property.primary_image"
                  :src="property.primary_image.thumbnail_path"
                  :alt="property.title"
                  loading="lazy"
                />
                <div v-else class="no-image">
                  <span>📷</span>
                </div>
              </div>

              <div class="property-content">
                <h3>{{ property.title }}</h3>
                <p class="property-location">📍 {{ property.city }}</p>
                
                <div class="property-details">
                  <span>👥 {{ property.guest_capacity }}</span>
                  <span>🛏️ {{ property.bedrooms }}</span>
                  <span>🛁 {{ property.bathrooms }}</span>
                </div>

                <div class="property-price">
                  <span class="price">{{ $t('common.from') }} €{{ Math.round(property.min_price || property.base_price) }}</span>
                  <span class="period">/ {{ $t('property.night') }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-properties">
            <div class="no-properties-icon">🏖️</div>
            <p>{{ $t('search.no_results') }}</p>
          </div>
        </div>

        <!-- Map -->
        <div class="map-container">
          <PropertyMap 
            :properties="properties"
            :selected-property="selectedProperty"
            @property-selected="selectProperty"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import PropertyMap from '@/components/map/PropertyMap.vue';
import propertyService from '@/services/propertyService';

const router = useRouter();
const toast = useToast();

const loading = ref(true);
const properties = ref([]);
const selectedProperty = ref(null);
const availableCities = ref([]);

const searchForm = ref({
  location: '',
  checkIn: '',
  checkOut: '',
  guests: 2
});

// Filters
const filters = ref({
  city: '',
  minPrice: null,
  maxPrice: null,
  guests: null,
  bedrooms: null
});

const loadProperties = async () => {
  loading.value = true;
  try {
    const searchParams = {
      status: 'published'
    };

    // Add filters to search params
    if (filters.value.city) {
      searchParams.city = filters.value.city;
    }
    if (filters.value.minPrice) {
      searchParams.min_price = filters.value.minPrice;
    }
    if (filters.value.maxPrice) {
      searchParams.max_price = filters.value.maxPrice;
    }
    if (filters.value.guests) {
      searchParams.guests = filters.value.guests;
    }
    if (filters.value.bedrooms) {
      searchParams.bedrooms = filters.value.bedrooms;
    }

    const response = await propertyService.searchProperties(searchParams);
    properties.value = response.properties || [];
    console.log('Loaded properties:', properties.value.length);
    console.log('First property:', properties.value[0]);
  } catch (error) {
    console.error('Error loading properties:', error);
    toast.error('Fehler beim Laden der Unterkünfte');
  } finally {
    loading.value = false;
  }
};

const loadCities = async () => {
  try {
    const response = await propertyService.searchProperties({ status: 'published' });
    const cities = [...new Set(response.properties.map(p => p.city))];
    availableCities.value = cities.sort();
  } catch (error) {
    console.error('Error loading cities:', error);
  }
};

// Watch filters and reload properties when they change
watch(filters, () => {
  loadProperties();
}, { deep: true });

const selectProperty = (property) => {
  selectedProperty.value = property;
};

const viewProperty = (propertyId) => {
  router.push(`/properties/${propertyId}`);
};

const resetFilters = () => {
  filters.value = {
    city: '',
    minPrice: null,
    maxPrice: null,
    guests: null,
    bedrooms: null
  };
};

const handleSearch = () => {
  router.push({
    name: 'search',
    query: {
      location: searchForm.value.location,
      checkIn: searchForm.value.checkIn,
      checkOut: searchForm.value.checkOut,
      guests: searchForm.value.guests
    }
  });
};

onMounted(() => {
  loadCities();
  loadProperties();
});
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--white);
  padding: 60px 0 80px;
  text-align: center;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 16px;
}

.tagline {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.search-box {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 24px;
  margin-top: 40px;
  background: var(--white);
  align-items: end;
}

.search-field {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.search-field label {
  color: var(--text-dark);
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.search-btn {
  height: 48px;
}

/* Properties & Map Section */
.properties-section {
  padding: 0;
  min-height: calc(100vh - 400px);
}

.properties-map-container {
  display: grid;
  grid-template-columns: 450px 1fr;
  height: calc(100vh - 400px);
  min-height: 600px;
}

.properties-list {
  background: var(--background);
  overflow-y: auto;
  border-right: 1px solid var(--border-color);
}

.properties-header {
  padding: 24px;
  background: var(--white);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.properties-header h2 {
  font-size: 20px;
  margin: 0;
}

.filters-bar {
  padding: 16px;
  background: var(--white);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-group {
  flex: 1;
  min-width: 100px;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--white);
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--primary);
}

.btn-clear-filters {
  padding: 8px 16px;
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
}

.btn-clear-filters:hover {
  background: var(--border-color);
}

.property-cards {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.property-card {
  display: flex;
  background: var(--white);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  cursor: pointer;
  border: 2px solid transparent;
}

.property-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.property-card.selected {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.property-image {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  overflow: hidden;
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
  background: var(--background);
  font-size: 48px;
}

.property-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-content h3 {
  font-size: 16px;
  margin: 0;
  color: var(--text-dark);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.property-location {
  color: var(--text-light);
  font-size: 14px;
  margin: 0;
}

.property-details {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: var(--text-light);
}

.property-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: auto;
}

.property-price .price {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 16px;
}

.property-price .period {
  color: var(--text-light);
  font-size: 14px;
}

.no-properties {
  padding: 80px 24px;
  text-align: center;
}

.no-properties-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-properties p {
  color: var(--text-light);
  font-size: 16px;
}

.map-container {
  position: relative;
  background: #e0e0e0;
}

/* Responsive */
@media (max-width: 1024px) {
  .properties-map-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .properties-list {
    height: 500px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .map-container {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px;
  }

  .tagline {
    font-size: 16px;
  }

  .search-box {
    grid-template-columns: 1fr;
  }

  .properties-map-container {
    grid-template-columns: 1fr;
  }

  .property-card {
    flex-direction: column;
  }

  .property-image {
    width: 100%;
    height: 200px;
  }
}
</style>

