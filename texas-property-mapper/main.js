// Set your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-97.7431, 30.2672], // Coordinates for Austin, TX
  zoom: 12 // Zoom level for Austin
});

map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Add at the top of your file
let submittedProperties = {
  type: 'FeatureCollection',
  features: []
};
let submittedSourceId = 'submitted-properties';

map.on('load', () => {
  // Load Building Footprints (local GeoJSON)
  map.addSource('buildings', {
    type: 'geojson',
    data: '/data/buildings.geojson'
  });

  map.addLayer({
    id: 'buildings-layer',
    type: 'fill',
    source: 'buildings',
    paint: {
      'fill-color': '#ff9900', // Bright orange for better visibility
      'fill-opacity': 0.6
    },
    layout: {
      'visibility': 'visible' // Explicitly set visibility to visible
    }
  });

  // Load FEMA Flood Zones (local GeoJSON)
  map.addSource('floodzones', {
    type: 'geojson',
    data: '/data/floodzones.geojson'
  });

  map.addLayer({
    id: 'floodzones-layer',
    type: 'fill',
    source: 'floodzones',
    paint: {
      'fill-color': '#e74c3c',
      'fill-opacity': 0.3
    },
    layout: {
      'visibility': 'visible' // Explicitly set visibility to visible
    }
  });

  // Add a source and layer for submitted properties
  map.addSource(submittedSourceId, {
    type: 'geojson',
    data: submittedProperties
  });
  map.addLayer({
    id: submittedSourceId,
    type: 'circle',
    source: submittedSourceId,
    paint: {
      'circle-radius': 7,
      'circle-color': '#007cbf',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });
});

let searchMarker = null; // Add this at the top of your file

// Address Search with Nominatim (OpenStreetMap)
function searchAddress() {
  const val = document.getElementById('addressInput').value;
  if (!val) return;

  // Use Mapbox Geocoding API to search for the address
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        map.flyTo({ center: [lng, lat], zoom: 12 });

        // Remove previous search marker if it exists
        if (searchMarker) {
          searchMarker.remove();
        }
        // Add a new marker at the searched location
        searchMarker = new mapboxgl.Marker({ color: "#2d72d9" })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<b>${val}</b>`))
          .addTo(map);
      } else {
        alert('Address not found. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error fetching geocoding data:', error);
      alert('An error occurred while searching for the address.');
    });
}
  

// Toggle Submit Form
document.getElementById('propertyFormToggle').addEventListener('click', () => {
  document.getElementById('propertyForm').classList.toggle('hidden');
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = `✅ ${message}`; // Add a checkmark emoji
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 3500);
}

// Submit Property
export function submitProperty() {
  const address = document.getElementById('formAddress').value;
  const type = document.getElementById('formType').value;
  const notes = document.getElementById('formNotes').value;

  if (!address.trim()) {
    alert("Address is required.");
    return;
  }

  // Use Mapbox Geocoding API to search for the address
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;

        // Center the map on the address
        map.flyTo({ center: [lng, lat], zoom: 14 });

        // Add new property to the collection
        submittedProperties.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: { address, type, notes }
        });

        // Update the source data
        map.getSource(submittedSourceId).setData(submittedProperties);

        showToast('Property submitted successfully!');
        document.getElementById('propertyForm').classList.add('hidden');
      } else {
        alert('Address not found. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error fetching geocoding data:', error);
      alert('An error occurred while submitting the property.');
    });
}

// Example fetch code in main.js
fetch('/data/buildings.geojson') // Updated path to sample data
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error fetching GeoJSON:', error);
  });

// Attach the searchAddress function to the global window object
window.searchAddress = searchAddress;

// Attach the submitProperty function to the global window object
window.submitProperty = submitProperty;

// Toggle Layer Visibility
function toggleLayer(layerId) {
  const visibility = map.getLayoutProperty(layerId, 'visibility');
  map.setLayoutProperty(layerId, 'visibility', visibility === 'visible' ? 'none' : 'visible');
}

// Attach the toggleLayer function to the global window object
window.toggleLayer = toggleLayer;
