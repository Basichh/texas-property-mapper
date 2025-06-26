 # Texas Property Mapping Prototype

A front-end prototype that visualizes public GIS data using Mapbox GL JS and allows users to submit properties directly onto the map.

## Features

- 📍 Interactive Mapbox map centered on Texas
- 🗺️ Mock GIS layer (e.g., FEMA flood zone or building footprint)
- 🔍 Simple address/coordinate input filter
- 📝 Slide-out form to submit property (adds marker on map)

## Setup Instructions

1. Clone the repository or unzip the files.
2. Replace `YOUR_MAPBOX_ACCESS_TOKEN` in `script.js` with your Mapbox public token.
3. Open `index.html` in a browser.

## Technical Decisions

- Used Mapbox GL JS for modern, responsive vector mapping
- Mocked GIS layer with a simple polygon (stored in `mock-data.json`)
- Kept geocoding minimal by simulating lat/lng input for ease
- All data additions (markers) are in-memory and not persisted

## Known Issues / Trade-offs

- No live geocoding integration
- GIS layer is local and mocked
- Marker submission doesn’t validate coordinates or persist data
- No mobile-specific layout tweaks

## License

Prototype only — no commercial use intended.
