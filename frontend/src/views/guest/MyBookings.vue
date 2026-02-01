<template>
  <div class="my-bookings">
    <div class="container">
      <h1>{{ $t('nav.my_bookings') }}</h1>
      <div class="card">
        <p>Your bookings will be displayed here.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.my-bookings {
  padding: 40px 0;
}

.card {
  margin-top: 32px;
  padding: 40px;
  text-align: center;
}
</style>
