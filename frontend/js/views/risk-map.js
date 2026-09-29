/**
 * TerraGuard AI - Fullscreen Risk GIS Map View (Vanilla JS)
 * Interactive geospatial map with layer controls, historical incident markers,
 * click-to-analyze pins, and search relocation.
 */
import api from '../api.js';
import { TerraGuardMap } from '../map.js';

export const RiskMapView = {
  render(container, state, router) {
    const target = state.activeLocationTarget || {
      name: "Wayanad Vythiri Ghats",
      lat: 11.5540,
      lon: 76.0422
    };

    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Top Controls Bar -->
        <div class="glass-panel" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 1.3rem; margin: 0 0 2px 0; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
              <span>🗺️</span> National Landslide Geospatial GIS Explorer
            </h2>
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              Visualizing Geological Survey of India (GSI) & NASA GLC historical landslide points across high-risk terrain.
            </span>
          </div>

          <!-- Layer Filters & Search -->
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <div style="display: flex; gap: 8px;">
              <input 
                type="text" 
                id="map-search-input" 
                class="form-control" 
                placeholder="Jump to location (e.g. Munnar, Shimla)..."
                style="font-size: 0.82rem; padding: 6px 12px; width: 220px;"
              />
              <button id="map-search-btn" class="btn btn-secondary btn-sm">
                🔍 Jump
              </button>
            </div>
            <button id="map-eval-active-btn" class="btn btn-primary btn-sm" style="font-weight: 600;">
              ⚡ Analyze Selected Pin
            </button>
          </div>
        </div>

        <!-- Map & Legend Container -->
        <div class="glass-panel" style="padding: 14px; position: relative;">
          <!-- Map Canvas -->
          <div id="full-gis-map" style="height: 600px; width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          </div>

          <!-- Floating Map Legend Overlay -->
          <div style="
            position: absolute; bottom: 30px; right: 30px; z-index: 1000;
            background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(12px);
            border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
            padding: 14px 18px; font-size: 0.78rem; max-width: 250px;
            box-shadow: var(--shadow-lg);
          ">
            <strong style="color: #FFFFFF; font-size: 0.85rem; display: block; margin-bottom: 8px;">
              Geospatial Legend
            </strong>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px;">📍</span>
                <span style="color: var(--emerald-400);">Selected Target Pin</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #EF4444; display: inline-block;"></span>
                <span style="color: #F8FAFC;">Critical/Fatal Incident</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: #F59E0B; display: inline-block;"></span>
                <span style="color: #F8FAFC;">High/Moderate Landslide</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 3px; background: #10B981; border: 1px dashed #10B981; display: inline-block;"></span>
                <span style="color: var(--text-muted);">25 km Proximity Radius</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    let gisMap = null;

    setTimeout(() => {
      gisMap = new TerraGuardMap('full-gis-map', {
        center: [target.lat, target.lon],
        zoom: 10
      });
      gisMap.init();
      gisMap.setSelectedLocation(target.lat, target.lon, target.name);

      // Handle map clicks
      gisMap.onClick(async (lat, lon) => {
        try {
          const rev = await api.reverseGeocode(lat, lon);
          target.name = rev.name || "Selected Coordinate";
          target.region = rev.region || "Custom Area";
        } catch {
          target.name = "Selected Point";
          target.region = "Custom Coordinates";
        }
        target.lat = lat;
        target.lon = lon;
        state.activeLocationTarget = { ...target };
        state.processingLocationName = target.name;
        gisMap.setSelectedLocation(lat, lon, target.name);
      });

      // Load all 165 historical events
      api.getHistoricalEvents(165, true).then(res => {
        if (res && res.events) {
          gisMap.setHistoricalEvents(res.events);
        }
      }).catch(() => {});
    }, 50);

    // Search Jump handler
    const sInput = document.getElementById('map-search-input');
    const sBtn = document.getElementById('map-search-btn');
    const handleJump = async () => {
      const q = sInput.value.trim();
      if (!q) return;
      try {
        const res = await api.geocode(q);
        if (res && res.results && res.results.length > 0) {
          const top = res.results[0];
          target.lat = top.latitude;
          target.lon = top.longitude;
          target.name = top.name;
          target.region = top.region;
          state.activeLocationTarget = { ...target };
          state.processingLocationName = target.name;
          gisMap.setSelectedLocation(top.latitude, top.longitude, top.name);
          gisMap.setView(top.latitude, top.longitude, 11);
        }
      } catch (err) {
        alert("Location search error: " + err.message);
      }
    };

    if (sBtn) sBtn.onclick = handleJump;
    if (sInput) sInput.onkeydown = (e) => { if (e.key === 'Enter') handleJump(); };

    // Analyze selected pin
    const evalBtn = document.getElementById('map-eval-active-btn');
    if (evalBtn) {
      evalBtn.onclick = () => {
        state.activeLocationTarget = { ...target };
        state.processingLocationName = target.name;
        router.navigate('processing');
      };
    }
  }
};

export default RiskMapView;
