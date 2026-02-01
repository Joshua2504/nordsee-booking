<template>
  <div class="home">
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

    <section class="featured">
      <div class="container">
        <h2>Beliebte Reiseziele</h2>
        <div class="destinations">
          <div class="destination-card">
            <div class="destination-image">🏖️</div>
            <h3>Sylt</h3>
            <p>Die Königin der Nordsee</p>
          </div>
          <div class="destination-card">
            <div class="destination-image">🌊</div>
            <h3>St. Peter-Ording</h3>
            <p>Endloser Strand & Wellness</p>
          </div>
          <div class="destination-card">
            <div class="destination-image">🏝️</div>
            <h3>Föhr</h3>
            <p>Die grüne Insel</p>
          </div>
          <div class="destination-card">
            <div class="destination-image">⛵</div>
            <h3>Amrum</h3>
            <p>Naturparadies</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchForm = ref({
  location: '',
  checkIn: '',
  checkOut: '',
  guests: 2
});

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
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--white);
  padding: 100px 0 150px;
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

.featured {
  padding: 80px 0;
}

.featured h2 {
  font-size: 32px;
  margin-bottom: 40px;
  text-align: center;
}

.destinations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.destination-card {
  background: var(--white);
  border-radius: var(--border-radius);
  padding: 32px;
  text-align: center;
  box-shadow: var(--shadow);
  transition: var(--transition);
  cursor: pointer;
}

.destination-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
}

.destination-image {
  font-size: 64px;
  margin-bottom: 16px;
}

.destination-card h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.destination-card p {
  color: var(--text-light);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px;
  }

  .search-box {
    grid-template-columns: 1fr;
  }
}
</style>
