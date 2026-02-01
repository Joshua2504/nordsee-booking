<template>
  <div class="property-map">
    <LMap
      ref="map"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      @ready="onMapReady"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </LMap>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

const props = defineProps({
  properties: {
    type: Array,
    default: () => []
  },
  selectedProperty: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['property-selected']);
const router = useRouter();

const map = ref(null);
const zoom = ref(8);
const center = ref([54.5260, 8.5726]); // North Sea coast center
const markerClusterGroup = ref(null);

const mapOptions = {
  zoomControl: true,
  scrollWheelZoom: true
};

// Only show properties with valid coordinates
const validProperties = computed(() => {
  const valid = props.properties.filter(p => p.latitude && p.longitude);
  console.log('Valid properties for map:', valid.length, 'out of', props.properties.length);
  return valid;
});

const onMapReady = () => {
  console.log('Map ready, properties:', props.properties.length);
  
  // Initialize marker cluster group
  if (map.value && map.value.leafletObject) {
    markerClusterGroup.value = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });
    
    map.value.leafletObject.addLayer(markerClusterGroup.value);
    updateMarkers();
  }
  
  if (validProperties.value.length > 0) {
    fitMapToBounds();
  }
};

const fitMapToBounds = () => {
  if (!map.value || !validProperties.value.length) return;
  
  const bounds = validProperties.value.map(p => [p.latitude, p.longitude]);
  
  if (bounds.length > 0) {
    map.value.leafletObject.fitBounds(bounds, { padding: [50, 50] });
  }
};

const getMarkerIcon = (property) => {
  const isSelected = props.selectedProperty && props.selectedProperty.id === property.id;
  const color = isSelected ? '#3498db' : '#667eea';
  const size = isSelected ? '14' : '12';
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="${size}" fill="${color}" stroke="white" stroke-width="3"/>
    </svg>
  `)}`;
};

const updateMarkers = () => {
  if (!markerClusterGroup.value) return;
  
  // Clear existing markers
  markerClusterGroup.value.clearLayers();
  
  // Add markers for all valid properties
  validProperties.value.forEach(property => {
    const icon = L.icon({
      iconUrl: getMarkerIcon(property),
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
    
    const marker = L.marker([property.latitude, property.longitude], { icon });
    
    // Create popup content
    const popupContent = `
      <div class="map-popup">
        <h4>${property.title}</h4>
        <p class="popup-location">${property.city}</p>
        <p class="popup-price">ab €${Math.round(property.min_price || property.base_price)} / Nacht</p>
        <button onclick="window.location.href='/properties/${property.id}'" class="btn btn-sm btn-primary">
          Ansehen
        </button>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    marker.on('click', () => selectProperty(property));
    
    markerClusterGroup.value.addLayer(marker);
  });
};

const selectProperty = (property) => {
  emit('property-selected', property);
};

const viewProperty = (propertyId) => {
  router.push(`/properties/${propertyId}`);
};

watch(() => props.properties, () => {
  console.log('Properties changed:', props.properties.length);
  if (markerClusterGroup.value) {
    updateMarkers();
  }
  if (map.value && validProperties.value.length > 0) {
    fitMapToBounds();
  }
}, { deep: true });

watch(() => props.selectedProperty, (newProperty) => {
  if (newProperty && newProperty.latitude && newProperty.longitude && map.value) {
    const currentZoom = map.value.leafletObject.getZoom();
    // Only zoom if we're zoomed out, don't zoom in too much
    const targetZoom = Math.max(currentZoom, 9);
    map.value.leafletObject.setView([newProperty.latitude, newProperty.longitude], targetZoom, {
      animate: true
    });
  }
});

onMounted(() => {
  console.log('PropertyMap mounted with', props.properties.length, 'properties');
});
</script>

<style scoped>
.property-map {
  width: 100%;
  height: 100%;
  position: relative;
}

.property-map :deep(.leaflet-container) {
  height: 100%;
  border-radius: var(--border-radius);
}

.map-popup {
  min-width: 200px;
}

.map-popup h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.popup-location {
  color: var(--text-light);
  font-size: 14px;
  margin: 4px 0;
}

.popup-price {
  font-weight: 600;
  color: var(--primary);
  margin: 8px 0;
}

.map-popup .btn {
  width: 100%;
  margin-top: 8px;
}
</style>
