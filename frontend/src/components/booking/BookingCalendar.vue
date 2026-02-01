<template>
  <div class="booking-calendar">
    <div class="calendar-header">
      <button @click="previousMonth" class="nav-btn" type="button">‹</button>
      <h4>{{ currentMonthName }} {{ currentYear }}</h4>
      <button @click="nextMonth" class="nav-btn" type="button">›</button>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else class="calendar-container">
      <div class="calendar-weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>

      <div class="calendar-days">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="[
            'calendar-day',
            {
              'empty': !day.date,
              'available': day.isAvailable && !day.isPast,
              'unavailable': !day.isAvailable || day.isPast,
              'check-in': day.date === checkIn,
              'check-out': day.date === checkOut,
              'in-range': isInRange(day.date)
            }
          ]"
          @click="selectDate(day)"
        >
          <span v-if="day.date" class="day-number">{{ day.dayOfMonth }}</span>
          <span v-if="day.date && day.price && day.isAvailable" class="day-price">€{{ Math.round(day.price) }}</span>
        </div>
      </div>

      <div v-if="checkIn && checkOut" class="booking-summary">
        <div class="summary-row">
          <span>{{ $t('booking.check_in') }}:</span>
          <strong>{{ formatDate(checkIn) }}</strong>
        </div>
        <div class="summary-row">
          <span>{{ $t('booking.check_out') }}:</span>
          <strong>{{ formatDate(checkOut) }}</strong>
        </div>
        <div class="summary-row">
          <span>{{ nights }} {{ nights === 1 ? $t('booking.night') : $t('booking.nights') }}</span>
          <strong>€{{ totalPrice.toFixed(2) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import propertyService from '@/services/propertyService';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  propertyId: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({ checkIn: null, checkOut: null })
  }
});

const emit = defineEmits(['update:modelValue', 'dates-selected']);

const { t: $t } = useI18n();

const loading = ref(true);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const availability = ref([]);
const checkIn = ref(props.modelValue?.checkIn || null);
const checkOut = ref(props.modelValue?.checkOut || null);

const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const currentMonthName = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value);
  return date.toLocaleDateString('de-DE', { month: 'long' });
});

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;

  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push({ date: null });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear.value, currentMonth.value, day);
    const dateString = formatDateLocal(date);
    const availabilityData = availability.value.find(a => a.date === dateString);
    const isPast = date < today;

    days.push({
      date: dateString,
      dayOfMonth: day,
      isAvailable: availabilityData?.is_available && availabilityData?.status === 'available',
      price: availabilityData?.price || null,
      isPast
    });
  }

  return days;
});

const nights = computed(() => {
  if (!checkIn.value || !checkOut.value) return 0;
  const start = new Date(checkIn.value);
  const end = new Date(checkOut.value);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const totalPrice = computed(() => {
  if (!checkIn.value || !checkOut.value) return 0;
  
  let total = 0;
  const start = new Date(checkIn.value);
  const end = new Date(checkOut.value);
  
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const dateString = formatDateLocal(d);
    const dayData = availability.value.find(a => a.date === dateString);
    total += dayData?.price || 0;
  }
  
  return total;
});

const isInRange = (date) => {
  if (!checkIn.value || !checkOut.value || !date) return false;
  return date > checkIn.value && date < checkOut.value;
};

const selectDate = (day) => {
  if (!day.date || day.isPast || !day.isAvailable) return;

  if (!checkIn.value || (checkIn.value && checkOut.value)) {
    // Start new selection
    checkIn.value = day.date;
    checkOut.value = null;
  } else if (day.date > checkIn.value) {
    // Set checkout date
    checkOut.value = day.date;
    emitDates();
  } else {
    // Reset if selecting earlier date
    checkIn.value = day.date;
    checkOut.value = null;
  }
};

const emitDates = () => {
  const dates = {
    checkIn: checkIn.value,
    checkOut: checkOut.value
  };
  emit('update:modelValue', dates);
  emit('dates-selected', dates);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
  availability.value = [];
  
  try {
    const startDate = new Date(currentYear.value, currentMonth.value, 1);
    const endDate = new Date(currentYear.value, currentMonth.value + 1, 0);
    
    const response = await propertyService.getAvailability(
      props.propertyId,
      formatDateLocal(startDate),
      formatDateLocal(endDate)
    );
    
    availability.value = response.availability || [];
  } catch (error) {
    console.error('Error loading availability:', error);
  } finally {
    loading.value = false;
  }
};

watch([currentMonth, currentYear], () => {
  loadAvailability();
});

onMounted(() => {
  loadAvailability();
});
</script>

<style scoped>
.booking-calendar {
  background: white;
  border-radius: 8px;
  padding: 1rem;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.calendar-header h4 {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0;
}

.nav-btn {
  background: #3498db;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: #2980b9;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 2px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 0.25rem;
  font-size: 0.75rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.15rem;
  background: white;
  font-size: 0.75rem;
}

.calendar-day.empty {
  border: none;
  cursor: default;
  background: transparent;
}

.calendar-day.available {
  background: #e8f5e9 !important;
  border-color: #4caf50 !important;
}

.calendar-day.available:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  background: #c8e6c9 !important;
}

.calendar-day.unavailable {
  background: #fafafa !important;
  border-color: #e0e0e0 !important;
  cursor: not-allowed;
  opacity: 0.5;
}

.calendar-day.check-in,
.calendar-day.check-out {
  background: #3498db !important;
  border-color: #2980b9 !important;
  color: white;
}

.calendar-day.check-in .day-number,
.calendar-day.check-out .day-number {
  color: white;
  font-weight: 700;
}

.calendar-day.check-in .day-price,
.calendar-day.check-out .day-price {
  color: white;
  background: rgba(255, 255, 255, 0.3);
}

.calendar-day.in-range {
  background: #bbdefb !important;
  border-color: #90caf9 !important;
}

.day-number {
  font-weight: 700;
  font-size: 0.8rem;
  color: #2c3e50;
  margin-bottom: 1px;
}

.day-price {
  font-size: 0.55rem;
  color: #000;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  padding: 1px 2px;
  border-radius: 2px;
  line-height: 1;
}

.booking-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  font-size: 0.9rem;
  color: #666;
}

.summary-row strong {
  color: #2c3e50;
  font-weight: 600;
}

@media (max-width: 768px) {
  .booking-calendar {
    padding: 1rem;
  }

  .calendar-header h4 {
    font-size: 1rem;
  }

  .nav-btn {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }

  .day-price {
    font-size: 0.6rem;
    padding: 1px 2px;
  }
}
</style>
