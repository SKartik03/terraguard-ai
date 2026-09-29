/**
 * TerraGuard AI - Home View (Vanilla JS)
 * Location-first entry point: search bar, geolocation, demo chips,
 * interactive Leaflet preview map, and historical incidents preview.
 */
import api from '../api.js';
import { TerraGuardMap } from '../map.js';

export const HomeView = {
  render(container, state, router) {
    let selectedLoc = { ...state.activeLocationTarget };
    let homeMap = null;

    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Hero Banner -->
        <div class="glass-panel" style="
          padding: 32px 36px;
          background: linear-gradient(135deg, rgba(14, 21, 36, 0.9) 0%, rgba(17, 24, 39, 0.75) 100%);
          border-left: 4px solid var(--emerald-500);
          position: relative;
          overflow: hidden;
        ">
          <div style="max-width: 820px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 12px; border-radius: 9999px; color: var(--emerald-400); font-size: 0.75rem; font-weight: 600; margin-bottom: 14px;">
              <span>🛡️</span> TerraGuard AI · Location-First Early Warning Platform
            </div>
            <h1 style="font-size: 2.2rem; font-weight: 800; line-height: 1.2; margin-bottom: 12px; color: #FFFFFF;">
              Assess Landslide Hazard Susceptibility for Any Location in India
            </h1>
            <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 22px;">
              Combines deterministic geotechnical slope physics (Mohr-Coulomb), live satellite telemetry, 
              165 historical disaster records, and Google Gemini API explainable narratives.
            </p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <button id="hero-analyze-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px; font-weight: 600;">
                <span>⚡</span> Analyze This Location
              </button>
              <button id="hero-map-btn" class="btn btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <span>🗺️</span> Open Full GIS Map
              </button>
            </div>
          </div>
        </div>

        <!-- Location Search & Selection Section -->
        <div class="glass-panel" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="font-size: 1.15rem; margin: 0 0 4px 0; color: #FFFFFF;">Select Assessment Location</h3>
              <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0;">
                Search by town/district, use browser GPS, or click directly on the interactive map below.
              </p>
            </div>
            <button id="btn-geolocation" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
              <span>📍</span> Use My Current Location
            </button>
          </div>

          <!-- Search Bar -->
          <div style="position: relative; margin-bottom: 14px;">
            <div style="display: flex; gap: 10px;">
              <input 
                type="text" 
                id="location-search-input"
                class="form-control" 
                placeholder="Search any place in India (e.g., Wayanad, Joshimath, Munnar, Pune, Kopargaon)..."
                style="flex: 1; font-size: 0.9rem;"
              />
              <button id="btn-search" class="btn btn-primary" style="padding: 0 20px;">
                🔍 Search
              </button>
            </div>
            <div id="search-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #0E1524; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); max-height: 220px; overflow-y: auto; z-index: 1000; box-shadow: var(--shadow-lg); margin-top: 4px;">
            </div>
          </div>

          <!-- Quick Preset Demo Chips -->
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">DEMO PRESETS:</span>
            <button class="preset-chip btn btn-secondary btn-sm" data-lat="11.5540" data-lon="76.0422" data-name="Wayanad Vythiri Ghats" data-region="Western Ghats, Kerala">
              Wayanad (Critical Hotspot)
            </button>
            <button class="preset-chip btn btn-secondary btn-sm" data-lat="30.5564" data-lon="79.5663" data-name="Joshimath Subsidence Ridge" data-region="Chamoli, Uttarakhand">
              Joshimath (Subsidence Area)
            </button>
            <button class="preset-chip btn btn-secondary btn-sm" data-lat="19.1608" data-lon="73.6827" data-name="Malin Hills Escarpment" data-region="Pune Ghats, Maharashtra">
              Malin Hills (High Risk)
            </button>
            <button class="preset-chip btn btn-secondary btn-sm" data-lat="11.3530" data-lon="76.7959" data-name="Nilgiris Coonoor Slopes" data-region="Tamil Nadu">
              Nilgiris (Moderate)
            </button>
            <button class="preset-chip btn btn-secondary btn-sm" data-lat="19.8833" data-lon="74.4833" data-name="Kopargaon" data-region="Ahmednagar, Maharashtra">
              Kopargaon (Zero-History Mode B)
            </button>
          </div>

          <!-- Current Selection Card -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 12px;">
            <div>
              <span style="font-size: 0.72rem; color: var(--emerald-400); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">ACTIVE TARGET LOCATION</span>
              <h4 id="active-target-name" style="margin: 2px 0 0 0; font-size: 1.05rem; color: #FFFFFF;">${selectedLoc.name}</h4>
              <span id="active-target-coords" style="font-size: 0.78rem; color: var(--text-muted);">${selectedLoc.lat.toFixed(4)}° N, ${selectedLoc.lon.toFixed(4)}° E · ${selectedLoc.region || 'India'}</span>
            </div>
            <button id="btn-start-analysis" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
              <span>⚡</span> Run Landslide Risk Assessment
            </button>
          </div>
        </div>

        <!-- Interactive Map Preview -->
        <div class="glass-panel" style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="margin: 0; font-size: 0.95rem; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
              <span>🗺️</span> Interactive Geospatial Inspection Map (Click anywhere to relocate pin)
            </h4>
            <span style="font-size: 0.72rem; color: var(--emerald-400); background: rgba(16, 185, 129, 0.1); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
              25 km Proximity Radius Active
            </span>
          </div>
          <div id="home-map-container" style="height: 380px; width: 100%; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-subtle);">
          </div>
        </div>

        <!-- Historical Events Preview Grid -->
        <div class="glass-panel" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h3 style="margin: 0; font-size: 1.1rem; color: #FFFFFF;">Recent Geological Incidents in Database</h3>
              <span style="color: var(--text-muted); font-size: 0.78rem;">Verified catalog entries from Geological Survey of India (GSI) & NASA GLC</span>
            </div>
            <button id="view-all-events-btn" class="btn btn-secondary btn-sm">
              View All 165 Records →
            </button>
          </div>
          <div id="home-events-grid" class="grid-3">
            <div style="text-align: center; padding: 24px; color: var(--text-muted);">Loading historical records...</div>
          </div>
        </div>

      </div>
    `;

    // 1. Initialize Map
    setTimeout(() => {
      homeMap = new TerraGuardMap('home-map-container', {
        center: [selectedLoc.lat, selectedLoc.lon],
        zoom: 10
      });
      homeMap.init();
      homeMap.setSelectedLocation(selectedLoc.lat, selectedLoc.lon, selectedLoc.name);

      // Handle map clicks
      homeMap.onClick(async (lat, lon) => {
        try {
          const rev = await api.reverseGeocode(lat, lon);
          updateTarget(lat, lon, rev.name || "Selected Coordinate", rev.region || "Custom Area");
        } catch {
          updateTarget(lat, lon, "Selected Point", "Manual Pin");
        }
      });

      // Load nearby incidents on map
      api.getNearbyEvents(selectedLoc.lat, selectedLoc.lon, 40).then(res => {
        if (res && res.events) {
          homeMap.setHistoricalEvents(res.events);
        }
      }).catch(() => {});
    }, 50);

    // 2. Helper to update selected location across UI and State
    const updateTarget = (lat, lon, name, region) => {
      selectedLoc = { lat, lon, name, region };
      state.activeLocationTarget = { lat, lon, name, region };
      state.processingLocationName = name;

      const nameEl = document.getElementById('active-target-name');
      const coordsEl = document.getElementById('active-target-coords');
      if (nameEl) nameEl.textContent = name;
      if (coordsEl) coordsEl.textContent = `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E · ${region}`;

      if (homeMap) {
        homeMap.setSelectedLocation(lat, lon, name);
      }
    };

    // 3. Preset chips handler
    container.querySelectorAll('.preset-chip').forEach(btn => {
      btn.onclick = () => {
        const lat = parseFloat(btn.dataset.lat);
        const lon = parseFloat(btn.dataset.lon);
        const name = btn.dataset.name;
        const region = btn.dataset.region;
        updateTarget(lat, lon, name, region);
      };
    });

    // 4. Geolocation handler
    const geoBtn = document.getElementById('btn-geolocation');
    if (geoBtn) {
      geoBtn.onclick = () => {
        if (!navigator.geolocation) {
          alert("Geolocation not supported by this browser.");
          return;
        }
        geoBtn.textContent = "⏳ Locating...";
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = parseFloat(pos.coords.latitude.toFixed(4));
            const lon = parseFloat(pos.coords.longitude.toFixed(4));
            geoBtn.textContent = "📍 Use My Current Location";
            try {
              const rev = await api.reverseGeocode(lat, lon);
              updateTarget(lat, lon, rev.name || "My Location", rev.region || "Current Device GPS");
            } catch {
              updateTarget(lat, lon, "Current Location", "GPS Coordinates");
            }
          },
          (err) => {
            geoBtn.textContent = "📍 Use My Current Location";
            alert("Unable to retrieve location: " + err.message);
          }
        );
      };
    }

    // 5. Search handler
    const searchInput = document.getElementById('location-search-input');
    const searchBtn = document.getElementById('btn-search');
    const dropdown = document.getElementById('search-dropdown');

    const performSearch = async () => {
      const q = searchInput.value.trim();
      if (!q) return;
      dropdown.style.display = 'block';
      dropdown.innerHTML = `<div style="padding: 12px; color: var(--text-muted); font-size: 0.85rem;">Searching catalogs for "${q}"...</div>`;

      try {
        const res = await api.geocode(q);
        if (res && res.results && res.results.length > 0) {
          dropdown.innerHTML = res.results.map(r => `
            <div class="search-result-item" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${r.name}" data-region="${r.region || ''}" style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;">
              <strong style="color: #FFFFFF; font-size: 0.88rem;">${r.name}</strong>
              <div style="color: var(--text-muted); font-size: 0.75rem;">${r.region || 'India'} (${r.latitude.toFixed(4)}°, ${r.longitude.toFixed(4)}°)</div>
            </div>
          `).join('');

          dropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.onclick = () => {
              const lat = parseFloat(item.dataset.lat);
              const lon = parseFloat(item.dataset.lon);
              const name = item.dataset.name;
              const region = item.dataset.region;
              updateTarget(lat, lon, name, region);
              dropdown.style.display = 'none';
            };
          });
        } else {
          dropdown.innerHTML = `<div style="padding: 12px; color: var(--text-muted); font-size: 0.85rem;">No places found matching "${q}". Try another location.</div>`;
        }
      } catch (err) {
        dropdown.innerHTML = `<div style="padding: 12px; color: #EF4444; font-size: 0.85rem;">Error searching places: ${err.message}</div>`;
      }
    };

    if (searchBtn) searchBtn.onclick = performSearch;
    if (searchInput) {
      searchInput.onkeydown = (e) => {
        if (e.key === 'Enter') performSearch();
      };
    }

    // 6. Action buttons to start evaluation
    const triggerAnalysis = () => {
      state.activeLocationTarget = selectedLoc;
      state.processingLocationName = selectedLoc.name;
      router.navigate('processing');
    };

    const startBtn = document.getElementById('btn-start-analysis');
    const heroBtn = document.getElementById('hero-analyze-btn');
    if (startBtn) startBtn.onclick = triggerAnalysis;
    if (heroBtn) heroBtn.onclick = triggerAnalysis;

    const heroMapBtn = document.getElementById('hero-map-btn');
    if (heroMapBtn) heroMapBtn.onclick = () => router.navigate('map');

    const viewEventsBtn = document.getElementById('view-all-events-btn');
    if (viewEventsBtn) viewEventsBtn.onclick = () => router.navigate('events');

    // 7. Load Recent Historical Events
    api.getHistoricalEvents(3, true).then(data => {
      const grid = document.getElementById('home-events-grid');
      if (!grid) return;
      if (!data || !data.events || data.events.length === 0) {
        grid.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem;">No historical records found.</div>`;
        return;
      }
      grid.innerHTML = data.events.map(ev => `
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span class="badge ${ev.severity === 'CRITICAL' ? 'badge-crit' : 'badge-mod'}">${ev.severity || 'HIGH'}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${ev.event_date || '2024'}</span>
          </div>
          <h4 style="font-size: 0.95rem; margin: 0 0 6px 0; color: #FFFFFF;">${ev.location_name}</h4>
          <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
            State: <strong>${ev.state || 'India'}</strong><br>
            Rainfall: <strong>${ev.rainfall_mm ? ev.rainfall_mm + ' mm' : 'Telemetry unavailable'}</strong><br>
            Catalog: <span style="color: var(--sky-400);">${ev.source_catalog}</span>
          </div>
        </div>
      `).join('');
    }).catch(() => {});
  }
};

export default HomeView;
