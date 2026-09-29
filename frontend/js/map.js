/**
 * TerraGuard AI - Leaflet GIS Map Manager (Vanilla JS)
 * Handles dark-mode map tiles, selected location pins, historical incident markers,
 * click-to-analyze interactions, and risk corridor overlays.
 */

// Dark Matter tile layer configuration
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/**
 * Creates custom Leaflet HTML DivIcons
 */
export function createDivIcon(html, className = '', iconSize = [32, 32], iconAnchor = [16, 32]) {
  if (typeof L === 'undefined') return null;
  return L.divIcon({
    html,
    className: `custom-div-icon ${className}`,
    iconSize,
    iconAnchor
  });
}

/**
 * Selected Target Marker Icon (Emerald Glow Pin)
 */
export function getSelectedLocationIcon(label = "Selected Target") {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="
        background: #10B981;
        color: #0F172A;
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.8), 0 2px 6px rgba(0,0,0,0.6);
        border: 2px solid #FFFFFF;
      ">
        <span style="transform: rotate(45deg); font-size: 13px; font-weight: bold;">📍</span>
      </div>
      <div style="
        background: rgba(15, 23, 42, 0.95);
        color: #34D399;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 10px;
        border: 1px solid rgba(16, 185, 129, 0.4);
        margin-top: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.6);
      ">
        ${label}
      </div>
    </div>
  `;
  return createDivIcon(html, 'target-marker', [30, 48], [15, 48]);
}

/**
 * Historical Landslide Event Icon (Red Hazard Dot)
 */
export function getHistoricalEventIcon(severity = "CRITICAL") {
  const isCrit = severity === "CRITICAL" || severity === "High";
  const color = isCrit ? "#EF4444" : "#F59E0B";
  const glow = isCrit ? "rgba(239, 68, 68, 0.6)" : "rgba(245, 158, 11, 0.6)";

  const html = `
    <div style="
      width: 14px;
      height: 14px;
      background: ${color};
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 8px ${glow};
      cursor: pointer;
    "></div>
  `;
  return createDivIcon(html, 'event-marker', [14, 14], [7, 7]);
}

/**
 * Safe Evacuation Shelter Icon (Cyan Shield)
 */
export function getShelterIcon() {
  const html = `
    <div style="
      background: #06B6D4;
      color: #0F172A;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.7);
      border: 2px solid #FFFFFF;
      font-size: 12px;
      font-weight: bold;
    ">
      🛡️
    </div>
  `;
  return createDivIcon(html, 'shelter-marker', [26, 26], [13, 13]);
}

/**
 * Main TerraGuard Map Controller
 */
export class TerraGuardMap {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      center: [11.5540, 76.0422], // Wayanad default
      zoom: 11,
      minZoom: 4,
      maxZoom: 18,
      ...options
    };
    this.map = null;
    this.targetMarker = null;
    this.radiusCircle = null;
    this.eventsLayer = null;
    this.routesLayer = null;
    this.riskZonesLayer = null;
    this.clickHandler = null;
  }

  /**
   * Initializes the Leaflet Map instance
   */
  init() {
    if (typeof L === 'undefined') {
      console.error("Leaflet (L) is not loaded!");
      return null;
    }

    const container = document.getElementById(this.containerId);
    if (!container) return null;

    // Destroy existing instance if container already initialized
    if (container._leaflet_id && this.map) {
      this.map.remove();
    }

    this.map = L.map(this.containerId, {
      center: this.options.center,
      zoom: this.options.zoom,
      minZoom: this.options.minZoom,
      maxZoom: this.options.maxZoom,
      zoomControl: true
    });

    // Dark Matter tile layer
    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIB,
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(this.map);

    // Initialize layer groups
    this.eventsLayer = L.layerGroup().addTo(this.map);
    this.routesLayer = L.layerGroup().addTo(this.map);
    this.riskZonesLayer = L.layerGroup().addTo(this.map);

    // Bind click-to-analyze listener
    this.map.on('click', (e) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lon = parseFloat(e.latlng.lng.toFixed(4));
      if (this.clickHandler) {
        this.clickHandler(lat, lon);
      }
    });

    return this.map;
  }

  /**
   * Sets callback for user clicks on map
   */
  onClick(callback) {
    this.clickHandler = callback;
  }

  /**
   * Updates or places the selected location marker and search radius circle
   */
  setSelectedLocation(lat, lon, label = "Selected Target", radiusKm = 25) {
    if (!this.map || typeof L === 'undefined') return;

    if (this.targetMarker) {
      this.map.removeLayer(this.targetMarker);
    }
    if (this.radiusCircle) {
      this.map.removeLayer(this.radiusCircle);
    }

    const icon = getSelectedLocationIcon(label);
    this.targetMarker = L.marker([lat, lon], { icon, zIndexOffset: 1000 }).addTo(this.map);
    this.targetMarker.bindPopup(`
      <div style="font-size: 13px; line-height: 1.4;">
        <strong style="color: #34D399; font-size: 14px;">📍 Selected Location</strong><br>
        <strong>${label}</strong><br>
        <span style="color: #94A3B8; font-size: 11px;">${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E</span>
      </div>
    `);

    // Proximity search radius circle (25km)
    this.radiusCircle = L.circle([lat, lon], {
      radius: radiusKm * 1000,
      color: '#10B981',
      weight: 1.5,
      dashArray: '4, 6',
      fillColor: '#10B981',
      fillOpacity: 0.05
    }).addTo(this.map);

    this.map.panTo([lat, lon]);
  }

  /**
   * Renders historical landslide incidents from catalog
   */
  setHistoricalEvents(events = []) {
    if (!this.map || !this.eventsLayer || typeof L === 'undefined') return;
    this.eventsLayer.clearLayers();

    events.forEach(ev => {
      const lat = ev.latitude;
      const lon = ev.longitude;
      if (!lat || !lon) return;

      const icon = getHistoricalEventIcon(ev.severity || ev.risk_class);
      const marker = L.marker([lat, lon], { icon });

      const distText = ev.distance_km != null ? `<br>Distance: <strong>${ev.distance_km.toFixed(1)} km</strong>` : '';
      const rainText = ev.rainfall_mm != null ? `<br>Recorded Rainfall: <strong>${ev.rainfall_mm} mm</strong>` : '';
      const casualtiesText = ev.fatalities ? `<br><span style="color: #EF4444;">Casualties: ${ev.fatalities}</span>` : '';

      marker.bindPopup(`
        <div style="font-size: 12px; line-height: 1.4; max-width: 220px;">
          <div style="font-weight: 700; color: #F8FAFC; font-size: 13px; margin-bottom: 4px;">
            ⚠️ ${ev.location_name || 'Historical Landslide'}
          </div>
          <div style="color: #94A3B8; font-size: 11px;">
            Date: ${ev.event_date || 'Documented Event'}<br>
            Source: <span style="color: #38BDF8;">${ev.source_catalog || 'GSI / NASA'}</span>
            ${distText}
            ${rainText}
            ${casualtiesText}
          </div>
        </div>
      `);

      this.eventsLayer.addLayer(marker);
    });
  }

  /**
   * Renders safe evacuation routing vector and shelters
   */
  setEvacuationRoute(startCoords, waypoints = [], shelterCoords = null, shelterName = "Designated Relief Center") {
    if (!this.map || !this.routesLayer || typeof L === 'undefined') return;
    this.routesLayer.clearLayers();

    const allPoints = [startCoords, ...waypoints];
    if (shelterCoords) allPoints.push(shelterCoords);

    // Route Polyline (Emerald Glowing Escape Corridor)
    const polyline = L.polyline(allPoints, {
      color: '#10B981',
      weight: 4,
      opacity: 0.85,
      dashArray: '6, 6'
    }).addTo(this.routesLayer);

    // Shelter destination pin
    if (shelterCoords) {
      const shelterIcon = getShelterIcon();
      const marker = L.marker(shelterCoords, { icon: shelterIcon }).addTo(this.routesLayer);
      marker.bindPopup(`
        <div style="font-size: 12px; line-height: 1.4;">
          <strong style="color: #06B6D4;">🛡️ ${shelterName}</strong><br>
          <span style="color: #94A3B8;">Verified High-Ground Evacuation Shelter</span>
        </div>
      `);
    }

    this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }

  /**
   * Centers and zooms map to coordinates
   */
  setView(lat, lon, zoom = 12) {
    if (this.map) {
      this.map.setView([lat, lon], zoom);
    }
  }

  /**
   * Invalidates size to fix container layout quirks on tab change
   */
  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 150);
    }
  }
}
