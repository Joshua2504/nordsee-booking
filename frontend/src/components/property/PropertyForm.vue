<template>
  <div class="property-form">
    <form @submit.prevent="handleSubmit">
      <!-- Basic Information -->
      <section class="form-section">
        <h3>{{ $t('propertyForm.basicInfo') }}</h3>
        
        <div class="form-group">
          <label for="title">{{ $t('propertyForm.title') }} *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            :placeholder="$t('propertyForm.titlePlaceholder')"
            maxlength="255"
          />
        </div>

        <div class="form-group">
          <label for="description">{{ $t('propertyForm.description') }} *</label>
          <textarea
            id="description"
            v-model="form.description"
            required
            rows="6"
            :placeholder="$t('propertyForm.descriptionPlaceholder')"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="property_type">{{ $t('propertyForm.propertyType') }} *</label>
            <select id="property_type" v-model="form.property_type" required>
              <option value="">{{ $t('propertyForm.selectType') }}</option>
              <option value="house">{{ $t('propertyType.house') }}</option>
              <option value="apartment">{{ $t('propertyType.apartment') }}</option>
              <option value="cottage">{{ $t('propertyType.cottage') }}</option>
              <option value="villa">{{ $t('propertyType.villa') }}</option>
              <option value="room">{{ $t('propertyType.room') }}</option>
              <option value="other">{{ $t('propertyType.other') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="status">{{ $t('propertyForm.status') }} *</label>
            <select id="status" v-model="form.status" required>
              <option value="draft">{{ $t('propertyStatus.draft') }}</option>
              <option value="published">{{ $t('propertyStatus.published') }}</option>
              <option value="unpublished">{{ $t('propertyStatus.unpublished') }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Location -->
      <section class="form-section">
        <h3>{{ $t('propertyForm.location') }}</h3>
        
        <div class="form-group">
          <label for="address">{{ $t('propertyForm.address') }} *</label>
          <input
            id="address"
            v-model="form.address"
            type="text"
            required
            :placeholder="$t('propertyForm.addressPlaceholder')"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city">{{ $t('propertyForm.city') }} *</label>
            <input
              id="city"
              v-model="form.city"
              type="text"
              required
              :placeholder="$t('propertyForm.cityPlaceholder')"
            />
          </div>

          <div class="form-group">
            <label for="postal_code">{{ $t('propertyForm.postalCode') }} *</label>
            <input
              id="postal_code"
              v-model="form.postal_code"
              type="text"
              required
              placeholder="12345"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="latitude">{{ $t('propertyForm.latitude') }}</label>
            <input
              id="latitude"
              v-model.number="form.latitude"
              type="number"
              step="0.000001"
              placeholder="54.123456"
            />
          </div>

          <div class="form-group">
            <label for="longitude">{{ $t('propertyForm.longitude') }}</label>
            <input
              id="longitude"
              v-model.number="form.longitude"
              type="number"
              step="0.000001"
              placeholder="8.123456"
            />
          </div>
        </div>
      </section>

      <!-- Property Details -->
      <section class="form-section">
        <h3>{{ $t('propertyForm.details') }}</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="guest_capacity">{{ $t('propertyForm.guestCapacity') }} *</label>
            <input
              id="guest_capacity"
              v-model.number="form.guest_capacity"
              type="number"
              required
              min="1"
              max="50"
            />
          </div>

          <div class="form-group">
            <label for="bedrooms">{{ $t('propertyForm.bedrooms') }} *</label>
            <input
              id="bedrooms"
              v-model.number="form.bedrooms"
              type="number"
              required
              min="0"
              max="50"
            />
          </div>

          <div class="form-group">
            <label for="beds">{{ $t('propertyForm.beds') }} *</label>
            <input
              id="beds"
              v-model.number="form.beds"
              type="number"
              required
              min="1"
              max="100"
            />
          </div>

          <div class="form-group">
            <label for="bathrooms">{{ $t('propertyForm.bathrooms') }} *</label>
            <input
              id="bathrooms"
              v-model.number="form.bathrooms"
              type="number"
              step="0.5"
              required
              min="0"
              max="50"
            />
          </div>
        </div>
      </section>

      <!-- Pricing -->
      <section class="form-section">
        <h3>{{ $t('propertyForm.pricing') }}</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="base_price">{{ $t('propertyForm.basePrice') }} (€) *</label>
            <input
              id="base_price"
              v-model.number="form.base_price"
              type="number"
              step="0.01"
              required
              min="1"
              :placeholder="$t('propertyForm.basePricePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label for="cleaning_fee">{{ $t('propertyForm.cleaningFee') }} (€)</label>
            <input
              id="cleaning_fee"
              v-model.number="form.cleaning_fee"
              type="number"
              step="0.01"
              min="0"
              :placeholder="$t('propertyForm.cleaningFeePlaceholder')"
            />
          </div>
        </div>
      </section>

      <!-- Amenities -->
      <section class="form-section">
        <h3>{{ $t('propertyForm.amenities') }}</h3>
        <AmenitySelector v-model="form.amenities" />
      </section>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          {{ $t('common.cancel') }}
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? $t('common.saving') : $t('common.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import AmenitySelector from './AmenitySelector.vue';

const props = defineProps({
  property: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

const isSubmitting = ref(false);

const form = ref({
  title: '',
  description: '',
  property_type: '',
  address: '',
  city: '',
  postal_code: '',
  country: 'Germany',
  latitude: null,
  longitude: null,
  guest_capacity: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  base_price: 50,
  cleaning_fee: 0,
  status: 'draft',
  amenities: []
});

// Load property data if editing
watch(() => props.property, (newProperty) => {
  if (newProperty) {
    form.value = {
      title: newProperty.title || '',
      description: newProperty.description || '',
      property_type: newProperty.property_type || '',
      address: newProperty.address || '',
      city: newProperty.city || '',
      postal_code: newProperty.postal_code || '',
      country: newProperty.country || 'Germany',
      latitude: newProperty.latitude || null,
      longitude: newProperty.longitude || null,
      guest_capacity: newProperty.guest_capacity || 2,
      bedrooms: newProperty.bedrooms || 1,
      beds: newProperty.beds || 1,
      bathrooms: newProperty.bathrooms || 1,
      base_price: parseFloat(newProperty.base_price) || 50,
      cleaning_fee: parseFloat(newProperty.cleaning_fee) || 0,
      status: newProperty.status || 'draft',
      amenities: newProperty.amenities?.map(a => a.id) || []
    };
  }
}, { immediate: true });

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    await emit('submit', form.value);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.property-form {
  max-width: 900px;
  margin: 0 auto;
}

.form-section {
  background: white;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
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
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .form-section {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
