<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>{{ $t('app.title') }}</h3>
          <p>{{ $t('app.tagline') }}</p>
        </div>

        <div class="footer-section">
          <h4>{{ $t('nav.search') }}</h4>
          <ul>
            <li><a href="#">Sylt</a></li>
            <li><a href="#">Föhr</a></li>
            <li><a href="#">Amrum</a></li>
            <li><a href="#">St. Peter-Ording</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Über uns</h4>
          <ul>
            <li><a href="#">Über Nordsee Booking</a></li>
            <li><a href="#">Karriere</a></li>
            <li><a href="#">Presse</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Hilfe-Center</a></li>
            <li><a href="#">Kontakt</a></li>
            <li><a href="#">Stornierungsbedingungen</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 Nordsee Booking. Alle Rechte vorbehalten.</p>
        <div class="footer-links">
          <a href="#">Datenschutz</a>
          <a href="#">AGB</a>
          <a href="#">Impressum</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: var(--text-dark);
  color: var(--white);
  padding: 60px 0 20px;
  margin-top: 80px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 16px;
}

.footer-section p {
  color: #ccc;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 12px;
}

.footer-section a {
  color: #ccc;
  transition: var(--transition);
}

.footer-section a:hover {
  color: var(--white);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: #ccc;
  transition: var(--transition);
}

.footer-links a:hover {
  color: var(--white);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
