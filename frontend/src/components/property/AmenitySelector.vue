<template>
  <div class="amenity-selector">
    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="amenities-grid">
      <div
        v-for="category in categories"
        :key="category"
        class="amenity-category"
      >
        <h4>{{ $t(`amenityCategory.${category}`) }}</h4>
        <div class="amenity-list">
          <label
            v-for="amenity in amenitiesByCategory[category]"
            :key="amenity.id"
            class="amenity-item"
          >
            <input
              type="checkbox"
              :value="amenity.id"
              :checked="modelValue.includes(amenity.id)"
              @change="toggleAmenity(amenity.id)"
            />
            <span class="amenity-icon">{{ amenity.icon }}</span>
            <span class="amenity-name">{{ $t(`amenity.${amenity.name.replace('amenity.', '')}`) }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import amenityService from '@/services/amenityService';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const loading = ref(false);
const error = ref(null);
const amenitiesByCategory = ref({});
const categories = ref([]);

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await amenityService.getByCategory();
    amenitiesByCategory.value = response.amenities;
    categories.value = Object.keys(response.amenities);
  } catch (err) {
    console.error('Error loading amenities:', err);
    error.value = 'Failed to load amenities';
  } finally {
    loading.value = false;
  }
});

const toggleAmenity = (amenityId) => {
  const selected = [...props.modelValue];
  const index = selected.indexOf(amenityId);

  if (index > -1) {
    selected.splice(index, 1);
  } else {
    selected.push(amenityId);
  }

  emit('update:modelValue', selected);
};
</script>

<style scoped>
.amenity-selector {
  padding: 1rem 0;
}

.loading, .error {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #e74c3c;
}

.amenities-grid {
  display: grid;
  gap: 2rem;
}

.amenity-category h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
  text-transform: capitalize;
}

.amenity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.amenity-item:hover {
  background: #e9ecef;
  border-color: #3498db;
}

.amenity-item input[type="checkbox"] {
  cursor: pointer;
}

.amenity-item input[type="checkbox"]:checked + .amenity-icon + .amenity-name {
  font-weight: 600;
  color: #3498db;
}

.amenity-icon {
  font-size: 1.25rem;
}

.amenity-name {
  font-size: 0.9rem;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .amenity-list {
    grid-template-columns: 1fr;
  }
}
</style>
