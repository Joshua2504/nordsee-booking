<template>
  <div class="booking-form">
    <form @submit.prevent="handleSubmit">
      <!-- Date Selection with Calendar -->
      <div class="form-section">
        <BookingCalendar 
          :property-id="property.id"
          v-model="selectedDates"
          @dates-selected="onDatesSelected"
        />
      </div>

      <div class="form-group">
        <label>{{ $t('search.guests') }}</label>
        <select v-model.number="guests" required class="form-control">
          <option v-for="n in property.guest_capacity" :key="n" :value="n">
            {{ n }} {{ n === 1 ? $t('booking.guest') : $t('search.guests') }}
          </option>
        </select>
      </div>

      <!-- Price Breakdown -->
      <div v-if="nights > 0" class="price-breakdown">
        <div class="price-row">
          <span>€{{ property.base_price }} × {{ nights }} {{ nights === 1 ? $t('property.night') : $t('booking.nights') }}</span>
          <span>€{{ accommodationTotal }}</span>
        </div>
        <div v-if="property.cleaning_fee" class="price-row">
          <span>{{ $t('property.cleaning_fee') }}</span>
          <span>€{{ property.cleaning_fee }}</span>
        </div>
        <div class="price-row">
          <span>{{ $t('property.service_fee') }} (5%)</span>
          <span>€{{ serviceFee }}</span>
        </div>
        <div class="price-row total">
          <span>{{ $t('property.total') }}</span>
          <span>€{{ totalPrice }}</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="submitting || !canBook"
        class="btn btn-primary btn-block"
      >
        <span v-if="submitting">{{ $t('booking.submitting') }}...</span>
        <span v-else>{{ $t('property.request_to_book') }}</span>
      </button>

      <p class="booking-notice">{{ $t('booking.noChargeNotice') }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import BookingCalendar from './BookingCalendar.vue';
import bookingService from '@/services/bookingService';

const props = defineProps({
  property: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const toast = useToast();

const selectedDates = ref({ checkIn: null, checkOut: null });
const guests = ref(1);
const submitting = ref(false);

const onDatesSelected = (dates) => {
  selectedDates.value = dates;
};

const nights = computed(() => {
  if (!selectedDates.value.checkIn || !selectedDates.value.checkOut) return 0;
  const checkInDate = new Date(selectedDates.value.checkIn);
  const checkOutDate = new Date(selectedDates.value.checkOut);
  const diffTime = checkOutDate - checkInDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const canBook = computed(() => {
  return selectedDates.value.checkIn && 
         selectedDates.value.checkOut && 
         nights.value > 0 && 
         guests.value > 0;
});

const today = new Date();
const minDate = computed(() => {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});

const checkOutMin = computed(() => {
  if (!checkIn.value) return minDate.value;
  const checkInDate = new Date(checkIn.value);
  checkInDate.setDate(checkInDate.getDate() + 1);
  return checkInDate.toISOString().split('T')[0];
});

const accommodationTotal = computed(() => {
  return (props.property.base_price * nights.value).toFixed(2);
});

const serviceFee = computed(() => {
  const base = parseFloat(accommodationTotal.value);
  const cleaning = parseFloat(props.property.cleaning_fee || 0);
  return ((base + cleaning) * 0.05).toFixed(2);
});

const totalPrice = computed(() => {
  const base = parseFloat(accommodationTotal.value);
  const cleaning = parseFloat(props.property.cleaning_fee || 0);
  const service = parseFloat(serviceFee.value);
  return (base + cleaning + service).toFixed(2);
});

const handleSubmit = async () => {
  if (!canBook.value) return;

  submitting.value = true;
  try {
    const bookingData = {
      property_id: props.property.id,
      check_in: selectedDates.value.checkIn,
      check_out: selectedDates.value.checkOut,
      check_out: checkOut.value,
      guests: guests.value,
      total_price: parseFloat(totalPrice.value)
    };

    const response = await bookingService.createBooking(bookingData);
    
    toast.success($t('booking.requestSent'));
    router.push('/bookings');
  } catch (error) {
    console.error('Error creating booking:', error);
    const message = error.response?.data?.message || 'Failed to create booking';
    toast.error(message);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.booking-form {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.price {
  font-size: 1.75rem;
  font-weight: bold;
  color: #3498db;
}

.period {
  color: #666;
  font-size: 1rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
}

.price-breakdown {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: #2c3e50;
}

.price-row:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}

.price-row.total {
  font-weight: bold;
  font-size: 1.1rem;
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 2px solid #2c3e50;
}

.btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
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
  background: #95a5a6;
  cursor: not-allowed;
  opacity: 0.6;
}

.booking-notice {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
