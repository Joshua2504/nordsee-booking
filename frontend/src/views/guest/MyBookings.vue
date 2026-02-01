<template>
  <div class="my-bookings-page">
    <div class="page-header">
      <h1>{{ $t('booking.title') }}</h1>
      <p>{{ $t('booking.manageBookings') }}</p>
    </div>

    <LoadingSpinner v-if="loading" :message="$t('common.loading')" />

    <div v-else-if="bookings.length > 0" class="bookings-list">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <div class="booking-image">
          <img
            v-if="booking.property.primary_image"
            :src="booking.property.primary_image.thumbnail_path"
            :alt="booking.property.title"
          />
          <div v-else class="no-image">📷</div>
        </div>

        <div class="booking-details">
          <h3>{{ booking.property.title }}</h3>
          <p class="property-location">📍 {{ booking.property.city }}</p>
          
          <div class="booking-dates">
            <div class="date-item">
              <span class="date-label">{{ $t('booking.check_in') }}:</span>
              <span class="date-value">{{ formatDate(booking.check_in) }}</span>
            </div>
            <div class="date-item">
              <span class="date-label">{{ $t('booking.check_out') }}:</span>
              <span class="date-value">{{ formatDate(booking.check_out) }}</span>
            </div>
          </div>

          <div class="booking-info">
            <span>👥 {{ booking.guests }} {{ booking.guests === 1 ? $t('booking.guest') : $t('booking.guests') }}</span>
            <span>🌙 {{ booking.nights }} {{ booking.nights === 1 ? $t('booking.night') : $t('booking.nights') }}</span>
            <span class="booking-price">€{{ booking.total_price }}</span>
          </div>

          <div class="booking-status">
            <span class="status-badge" :class="`status-${booking.status}`">
              {{ $t(`booking.${booking.status}`) }}
            </span>
          </div>

          <div v-if="booking.status === 'pending'" class="booking-actions">
            <button 
              @click="cancelBooking(booking)"
              class="btn btn-outline btn-sm"
            >
              {{ $t('booking.cancel_booking') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📅</div>
      <h2>{{ $t('booking.noBookings') }}</h2>
      <p>{{ $t('booking.noBookingsDescription') }}</p>
      <RouterLink to="/search" class="btn btn-primary">
        {{ $t('search.title') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import bookingService from '@/services/bookingService';

const toast = useToast();
const { t: $t } = useI18n();
const loading = ref(true);
const bookings = ref([]);

const loadBookings = async () => {
  loading.value = true;
  try {
    const response = await bookingService.getGuestBookings();
    bookings.value = response.bookings;
  } catch (error) {
    console.error('Error loading bookings:', error);
    toast.error('Failed to load bookings');
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const cancelBooking = async (booking) => {
  if (!confirm($t('booking.cancelConfirm'))) return;

  try {
    await bookingService.cancelBooking(booking.id);
    toast.success('Booking cancelled successfully');
    loadBookings();
  } catch (error) {
    console.error('Error cancelling booking:', error);
    toast.error('Failed to cancel booking');
  }
};

onMounted(() => {
  loadBookings();
});
</script>

<style scoped>
.my-bookings-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.booking-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 250px 1fr;
  transition: transform 0.2s, box-shadow 0.2s;
}

.booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.booking-image {
  height: 200px;
  overflow: hidden;
  background: #e0e0e0;
}

.booking-image img {
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
  font-size: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.booking-details {
  padding: 1.5rem;
}

.booking-details h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.property-location {
  color: #666;
  margin-bottom: 1rem;
}

.booking-dates {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.date-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 600;
}

.date-value {
  font-size: 1rem;
  color: #2c3e50;
}

.booking-info {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.booking-info span {
  color: #666;
}

.booking-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #3498db !important;
  margin-left: auto;
}

.booking-status {
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.booking-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
  text-align: center;
}

.btn-sm {
  padding: 0.4rem 1rem;
  font-size: 0.875rem;
}

.btn-outline {
  background: white;
  color: #e74c3c;
  border: 2px solid #e74c3c;
}

.btn-outline:hover {
  background: #e74c3c;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.btn-primary {
  background: #3498db;
  color: white;
  padding: 0.75rem 2rem;
}

.btn-primary:hover {
  background: #2980b9;
}

@media (max-width: 768px) {
  .booking-card {
    grid-template-columns: 1fr;
  }

  .booking-image {
    height: 150px;
  }

  .booking-dates {
    flex-direction: column;
    gap: 0.75rem;
  }

  .booking-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .booking-price {
    margin-left: 0;
  }
}
</style>