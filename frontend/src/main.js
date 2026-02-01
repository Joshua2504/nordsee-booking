import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import Toast from 'vue-toastification';
import VCalendar from 'v-calendar';
import VueLazyload from 'vue-lazyload';
import App from './App.vue';
import router from './router';
import de from './locales/de.json';
import en from './locales/en.json';

import 'vue-toastification/dist/index.css';
import 'v-calendar/style.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './assets/main.css';

// Fix Leaflet default marker icon issue
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'de',
  fallbackLocale: 'en',
  messages: {
    de,
    en
  }
});

// Create Pinia store
const pinia = createPinia();

// Create Vue app
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
});
app.use(VCalendar, {});
app.use(VueLazyload, {
  preLoad: 1.3,
  error: '/placeholder-error.png',
  loading: '/placeholder-loading.png',
  attempt: 1
});

app.mount('#app');
