<template>
  <div class="dashboard">
    <div class="container">
      <h1>{{ $t('nav.host_dashboard') }}</h1>
      <div class="dashboard-grid">
        <div class="card">
          <h3>My Properties</h3>
          <p>Manage your property listings</p>
          <RouterLink to="/host/properties/create" class="btn btn-primary">
            {{ $t('nav.create_property') }}
          </RouterLink>
        </div>
        <div class="card">
          <h3>Bookings</h3>
          <p>View and manage bookings</p>
          <RouterLink to="/host/bookings" class="btn btn-outline">
            View Bookings
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.dashboard {
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
