---
name: map_integration_specialist
description: Expert skill for integrating Leaflet maps with geocoding, search, and auto-fit functionalities.
---
# Map Integration Specialist Skill

Use this skill to implement and maintain advanced map features using Leaflet and OpenStreetMap (Nominatim).

## Core Requirements

### 1. Leaflet & React Implementation
- **Container:** Always use `z-[9999]` for modals containing maps to avoid layer obstruction.
- **Icon Fix:** Use standard icon merge options to avoid missing marker images in production/Vite.
  ```javascript
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '...',
    iconUrl: '...',
    shadowUrl: '...',
  });
  ```

### 2. Geocoding Logic (Nominatim)
- **Search:** Use `https://nominatim.openstreetmap.org/search?format=json&q=...`.
- **Reverse Geocoding:** Use `https://nominatim.openstreetmap.org/reverse?format=json&lat=...&lon=...&zoom=10`.
- **Policy:** Always include a descriptive `User-Agent` and implement a delay (e.g., 1-2 seconds) between batch requests to respect OSM usage policies.

### 3. Automated UX Features
- **Auto-Fit Bounds:** Implement a sub-component using `useMap()` and `map.fitBounds()` to ensure all markers are visible by default.
- **Auto-Pin:** Enable coordinate selection via address search or clicking on the map.
- **Auto-Region Detection:** Automatically update regional dropdowns/fields based on coordinates using reverse geocoding results (e.g., matching city/county names).

## Verification Steps
- Verify marker placement (ensure coordinates are correctly saved).
- Test search across different levels (Address, Sub-district, City).
- Confirm auto-zoom behavior on initial map load.
