<template>
  <div class="guest-dashboard">
    <div class="container">
      <h1>{{ $t('nav.guest_dashboard') }}</h1>
      <div class="dashboard-grid">
        <div class="card">
          <h3>My Bookings</h3>
          <p>View your past and upcoming bookings</p>
          <RouterLink to="/guest/bookings" class="btn btn-primary">
            {{ $t('nav.my_bookings') }}
          </RouterLink>
        </div>
        <div class="card">
          <h3>Search Properties</h3>
          <p>Find your next vacation home</p>
          <RouterLink to="/search" class="btn btn-outline">
            {{ $t('nav.search') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.guest-dashboard {
  padding: 40px 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.card {
  padding: 32px;
  text-align: center;
}

.card h3 {
  margin-bottom: 12px;
}

.card p {
  color: var(--text-light);
  margin-bottom: 24px;
}
</style>
