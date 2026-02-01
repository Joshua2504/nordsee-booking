<template>
  <div class="availability-calendar">
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-btn">
        ‹
      </button>
      <h3>{{ currentMonthName }} {{ currentYear }}</h3>
      <button @click="nextMonth" class="nav-btn">
        ›
      </button>
    </div>

    <LoadingSpinner v-if="loading" :message="$t('common.loading')" />

    <div v-else class="calendar-container">
      <div class="calendar-legend">
        <div class="legend-item">
          <span class="legend-color available"></span>
          <span>{{ $t('availability.available') }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-color booked"></span>
          <span>{{ $t('availability.booked') }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-color blocked"></span>
          <span>{{ $t('availability.blocked') }}</span>
        </div>
      </div>

      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>

        <div class="calendar-days">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'calendar-day',
              {
                'empty': !day.date,
                'available': day.status === 'available',
                'booked': day.status === 'booked',
                'blocked': day.status === 'blocked',
                'past': day.isPast,
                'selected': isSelected(day)
              }
            ]"
            @click="toggleDate(day)"
          >
            <span v-if="day.date" class="day-number">{{ day.dayOfMonth }}</span>
            <span v-if="day.price" class="day-price">€{{ day.price }}</span>
          </div>
        </div>
      </div>

      <div v-if="selectedDates.length > 0" class="actions-panel">
        <div class="selected-info">
          <strong>{{ selectedDates.length }}</strong> {{ $t('availability.daysSelected') }}
        </div>
        
        <div class="action-buttons">
          <button @click="markAsAvailable" class="btn btn-success btn-sm">
            {{ $t('availability.markAvailable') }}
          </button>
          <button @click="markAsBlocked" class="btn btn-warning btn-sm">
            {{ $t('availability.markBlocked') }}
          </button>
          <button @click="clearSelection" class="btn btn-outline btn-sm">
            {{ $t('availability.clearSelection') }}
          </button>
        </div>

        <div class="price-override">
          <label>{{ $t('availability.customPrice') }}</label>
          <input 
            v-model="customPrice" 
            type="number" 
            step="0.01" 
            min="0"
            :placeholder="$t('availability.customPricePlaceholder')"
            class="form-control"
          />
          <button @click="applyCustomPrice" class="btn btn-primary btn-sm">
            {{ $t('availability.applyPrice') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import propertyService from '@/services/propertyService';

const props = defineProps({
  propertyId: {
    type: Number,
    required: true
  }
});

const toast = useToast();
const { t: $t } = useI18n();

const loading = ref(true);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const availability = ref([]);
const selectedDates = ref([]);
const customPrice = ref(null);

const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const currentMonthName = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value);
  return date.toLocaleDateString('de-DE', { month: 'long' });
});

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  let startDay = firstDay.getDay();
  // Convert to Monday = 0, Sunday = 6
  startDay = startDay === 0 ? 6 : startDay - 1;

  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startDay; i++) {
    days.push({ date: null });
  }

  // Add all days of the month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear.value, currentMonth.value, day);
    const dateString = date.toISOString().split('T')[0];
    const availabilityData = availability.value.find(a => a.date === dateString);
    const isPast = date < today;

    days.push({
      date: dateString,
      dayOfMonth: day,
      status: availabilityData?.status || 'available',
      price: availabilityData?.price || null,
      isAvailable: availabilityData?.is_available !== false,
      isPast
    });
  }

  return days;
});

const isSelected = (day) => {
  if (!day.date) return false;
  return selectedDates.value.includes(day.date);
};

const toggleDate = (day) => {
  if (!day.date || day.isPast || day.status === 'booked') return;

  const index = selectedDates.value.indexOf(day.date);
  if (index > -1) {
    selectedDates.value.splice(index, 1);
  } else {
    selectedDates.value.push(day.date);
  }
};

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const loadAvailability = async () => {
  loading.value = true;
  try {
    const startDate = new Date(currentYear.value, currentMonth.value, 1);
    const endDate = new Date(currentYear.value, currentMonth.value + 1, 0);
    
    const response = await propertyService.getAvailability(
      props.propertyId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    availability.value = response.availability;
  } catch (error) {
    console.error('Error loading availability:', error);
    toast.error('Failed to load availability');
  } finally {
    loading.value = false;
  }
};

const markAsAvailable = async () => {
  if (selectedDates.value.length === 0) return;

  try {
    await propertyService.updateAvailability(props.propertyId, {
      dates: selectedDates.value,
      is_available: true,
      status: 'available'
    });
    
    toast.success($t('availability.updated'));
    clearSelection();
    loadAvailability();
  } catch (error) {
    console.error('Error updating availability:', error);
    toast.error('Failed to update availability');
  }
};

const markAsBlocked = async () => {
  if (selectedDates.value.length === 0) return;

  try {
    await propertyService.updateAvailability(props.propertyId, {
      dates: selectedDates.value,
      is_available: false,
      status: 'blocked'
    });
    
    toast.success($t('availability.updated'));
    clearSelection();
    loadAvailability();
  } catch (error) {
    console.error('Error updating availability:', error);
    toast.error('Failed to update availability');
  }
};

const applyCustomPrice = async () => {
  if (selectedDates.value.length === 0 || !customPrice.value) return;

  try {
    await propertyService.updateAvailability(props.propertyId, {
      dates: selectedDates.value,
      price: parseFloat(customPrice.value)
    });
    
    toast.success($t('availability.priceUpdated'));
    customPrice.value = null;
    clearSelection();
    loadAvailability();
  } catch (error) {
    console.error('Error updating price:', error);
    toast.error('Failed to update price');
  }
};

const clearSelection = () => {
  selectedDates.value = [];
  customPrice.value = null;
};

watch([currentMonth, currentYear], () => {
  loadAvailability();
  clearSelection();
});

onMounted(() => {
  loadAvailability();
});
</script>

<style scoped>
.availability-calendar {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.calendar-header h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.nav-btn {
  background: #3498db;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: #2980b9;
}

.calendar-legend {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.legend-color.available {
  background: #d4edda;
}

.legend-color.booked {
  background: #f8d7da;
}

.legend-color.blocked {
  background: #fff3cd;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  padding: 0.25rem;
}

.calendar-day.empty {
  border: none;
  cursor: default;
}

.calendar-day.available {
  background: #d4edda;
  border-color: #c3e6cb;
}

.calendar-day.booked {
  background: #f8d7da;
  border-color: #f5c6cb;
  cursor: not-allowed;
}

.calendar-day.blocked {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.calendar-day.past {
  opacity: 0.4;
  cursor: not-allowed;
}

.calendar-day.selected {
  box-shadow: 0 0 0 3px #3498db;
  transform: scale(1.05);
}

.calendar-day:not(.empty):not(.past):not(.booked):hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.day-number {
  font-weight: 600;
  font-size: 1rem;
  color: #2c3e50;
}

.day-price {
  font-size: 0.75rem;
  color: #3498db;
  font-weight: 500;
}

.actions-panel {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
}

.selected-info {
  text-align: center;
  margin-bottom: 1rem;
  color: #666;
  font-size: 1.1rem;
}

.selected-info strong {
  color: #3498db;
  font-size: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.price-override {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.price-override label {
  font-weight: 600;
  color: #2c3e50;
}

.price-override input {
  max-width: 150px;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 0.4rem 1rem;
  font-size: 0.875rem;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-outline {
  background: white;
  color: #666;
  border: 2px solid #ddd;
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #999;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .availability-calendar {
    padding: 1rem;
  }

  .calendar-header h3 {
    font-size: 1.25rem;
  }

  .nav-btn {
    width: 35px;
    height: 35px;
    font-size: 1.25rem;
  }

  .calendar-legend {
    gap: 1rem;
  }

  .legend-item {
    font-size: 0.875rem;
  }

  .day-price {
    display: none;
  }

  .price-override {
    flex-direction: column;
    align-items: stretch;
  }

  .price-override input {
    max-width: 100%;
  }
}
</style>
