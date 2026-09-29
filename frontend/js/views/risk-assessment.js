/**
 * TerraGuard AI - Risk Assessment Form View (Vanilla JS)
 * Interactive parameter adjustments for custom simulation and geotechnical stress testing.
 */
import api from '../api.js';

export const RiskAssessmentView = {
  render(container, state, router) {
    const params = state.assessmentParams;

    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Header -->
        <div class="glass-panel" style="padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem; margin: 0 0 4px 0; color: #FFFFFF;">Geotechnical Stress Test & Custom Assessment</h1>
            <span style="font-size: 0.82rem; color: var(--text-muted);">
              Adjust hydrological thresholds, shear angles, and lithological parameters to simulate slope failure boundaries.
            </span>
          </div>
          <button id="form-auto-telemetry-btn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
            📡 Auto-Populate Live Telemetry
          </button>
        </div>

        <!-- Form Cards Container -->
        <div class="grid-2">
          
          <!-- Column 1: Spatial & Hydrological Parameters -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 18px;">
            <h3 style="margin: 0; font-size: 1.1rem; color: #FFFFFF; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
              📍 Location & Atmospheric Conditions
            </h3>

            <!-- Location Name -->
            <div>
              <label class="form-label">Location / Site Name</label>
              <input type="text" id="param-name" class="form-control" value="${params.location_name}">
            </div>

            <!-- Coords (Lat/Lon) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label class="form-label">Latitude (°N)</label>
                <input type="number" step="0.0001" id="param-lat" class="form-control" value="${params.latitude}">
              </div>
              <div>
                <label class="form-label">Longitude (°E)</label>
                <input type="number" step="0.0001" id="param-lon" class="form-control" value="${params.longitude}">
              </div>
            </div>

            <!-- Rainfall Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <label class="form-label" style="margin: 0;">Cumulative Precipitation Volume</label>
                <span id="label-rainfall" style="color: var(--emerald-400); font-weight: 700; font-size: 0.9rem;">${params.rainfall_mm} mm</span>
              </div>
              <input type="range" min="0" max="250" step="1" id="param-rainfall" class="form-range" value="${params.rainfall_mm}">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
                <span>0 mm (Dry)</span>
                <span>80 mm (Threshold)</span>
                <span>250 mm (Extreme Cloudburst)</span>
              </div>
            </div>

            <!-- Forecast Window -->
            <div>
              <label class="form-label">Precipitation Accumulation Window</label>
              <select id="param-window" class="form-control">
                <option value="6" ${params.window_hours == 6 ? 'selected' : ''}>6 Hours (Flash Rain Trigger)</option>
                <option value="12" ${params.window_hours == 12 ? 'selected' : ''}>12 Hours (Sustained Downpour)</option>
                <option value="24" ${params.window_hours == 24 ? 'selected' : ''}>24 Hours (Standard Operational)</option>
                <option value="48" ${params.window_hours == 48 ? 'selected' : ''}>48 Hours (Multi-Day Saturation)</option>
                <option value="72" ${params.window_hours == 72 ? 'selected' : ''}>72 Hours (Monsoon Extended Window)</option>
              </select>
            </div>
          </div>

          <!-- Column 2: Geotechnical & Soil Parameters -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 18px;">
            <h3 style="margin: 0; font-size: 1.1rem; color: #FFFFFF; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
              🔬 Geotechnical & Lithological Factors
            </h3>

            <!-- Slope Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <label class="form-label" style="margin: 0;">Terrain Slope Incline Angle</label>
                <span id="label-slope" style="color: var(--sky-400); font-weight: 700; font-size: 0.9rem;">${params.slope_deg}°</span>
              </div>
              <input type="range" min="0" max="60" step="0.5" id="param-slope" class="form-range" value="${params.slope_deg}">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
                <span>0° (Flat Plains)</span>
                <span>25° (Critical Slope)</span>
                <span>60° (Near Escarpment)</span>
              </div>
            </div>

            <!-- Soil Moisture Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <label class="form-label" style="margin: 0;">Soil Moisture Saturation Ratio</label>
                <span id="label-moisture" style="color: #A78BFA; font-weight: 700; font-size: 0.9rem;">${params.soil_moisture_pct}%</span>
              </div>
              <input type="range" min="0" max="100" step="1" id="param-moisture" class="form-range" value="${params.soil_moisture_pct}">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
                <span>0% (Pore Water Empty)</span>
                <span>65% (Pore Pressure Warning)</span>
                <span>100% (Complete Liquefaction)</span>
              </div>
            </div>

            <!-- Geology Condition -->
            <div>
              <label class="form-label">Bedrock Lithology & Geological Stability</label>
              <select id="param-geology" class="form-control">
                <option value="Stable" ${params.geology_condition === 'Stable' ? 'selected' : ''}>Stable (Crystalline Basalt / Granitic Shield)</option>
                <option value="Moderate" ${params.geology_condition === 'Moderate' ? 'selected' : ''}>Moderate (Weathered Gneiss / Sandstone)</option>
                <option value="Weak" ${params.geology_condition === 'Weak' ? 'selected' : ''}>Weak (Fractured Phyllite / Clayey Colluvium)</option>
              </select>
            </div>

            <!-- Land Cover -->
            <div>
              <label class="form-label">Surface Land Cover Classification</label>
              <select id="param-landcover" class="form-control">
                <option value="Forest" ${params.land_cover === 'Forest' ? 'selected' : ''}>Forest (Deep Root Mechanical Cohesion)</option>
                <option value="Grassland" ${params.land_cover === 'Grassland' ? 'selected' : ''}>Grassland / Shrubland</option>
                <option value="Agriculture" ${params.land_cover === 'Agriculture' ? 'selected' : ''}>Agriculture (Terraced Cultivation)</option>
                <option value="Urban" ${params.land_cover === 'Urban' ? 'selected' : ''}>Urban / Built-up Infrastructure</option>
                <option value="Barren" ${params.land_cover === 'Barren' ? 'selected' : ''}>Barren / Exposed Excavated Slope</option>
              </select>
            </div>

            <!-- NDVI Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <label class="form-label" style="margin: 0;">Vegetation Canopy Index (NDVI)</label>
                <span id="label-ndvi" style="color: var(--emerald-400); font-weight: 700; font-size: 0.9rem;">${params.ndvi.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" id="param-ndvi" class="form-range" value="${params.ndvi}">
            </div>
          </div>

        </div>

        <!-- Submit Bar -->
        <div class="glass-panel" style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <span style="font-size: 0.82rem; color: var(--text-muted);">
            Evaluates deterministic Mohr-Coulomb Layer 1 formula + trained Random Forest Layer 2 ML model.
          </span>
          <button id="form-submit-assessment-btn" class="btn btn-primary" style="padding: 12px 28px; font-size: 0.95rem; font-weight: 700;">
            ⚡ Run Multi-Layer Risk Evaluation
          </button>
        </div>

      </div>
    `;

    // Sliders Live Value Binding
    const bindSlider = (sliderId, labelId, suffix = '') => {
      const slider = document.getElementById(sliderId);
      const label = document.getElementById(labelId);
      if (slider && label) {
        slider.oninput = () => {
          label.textContent = `${slider.value}${suffix}`;
        };
      }
    };

    bindSlider('param-rainfall', 'label-rainfall', ' mm');
    bindSlider('param-slope', 'label-slope', '°');
    bindSlider('param-moisture', 'label-moisture', '%');
    bindSlider('param-ndvi', 'label-ndvi');

    // Auto-populate telemetry button
    const autoBtn = document.getElementById('form-auto-telemetry-btn');
    if (autoBtn) {
      autoBtn.onclick = async () => {
        const lat = parseFloat(document.getElementById('param-lat').value);
        const lon = parseFloat(document.getElementById('param-lon').value);
        autoBtn.textContent = "⏳ Fetching...";
        try {
          const res = await api.getLiveWeatherAssessment(lat, lon);
          if (res) {
            if (res.rainfall_mm != null) {
              document.getElementById('param-rainfall').value = res.rainfall_mm;
              document.getElementById('label-rainfall').textContent = `${res.rainfall_mm} mm`;
            }
            if (res.slope_deg != null) {
              document.getElementById('param-slope').value = res.slope_deg;
              document.getElementById('label-slope').textContent = `${res.slope_deg}°`;
            }
            if (res.soil_moisture_pct != null) {
              document.getElementById('param-moisture').value = res.soil_moisture_pct;
              document.getElementById('label-moisture').textContent = `${res.soil_moisture_pct}%`;
            }
            alert("Updated parameters with live meteorological and elevation telemetry!");
          }
        } catch (err) {
          alert("Telemetry error: " + err.message);
        } finally {
          autoBtn.textContent = "📡 Auto-Populate Live Telemetry";
        }
      };
    }

    // Submit evaluation
    const submitBtn = document.getElementById('form-submit-assessment-btn');
    if (submitBtn) {
      submitBtn.onclick = () => {
        const updatedParams = {
          location_name: document.getElementById('param-name').value,
          latitude: parseFloat(document.getElementById('param-lat').value),
          longitude: parseFloat(document.getElementById('param-lon').value),
          rainfall_mm: parseFloat(document.getElementById('param-rainfall').value),
          slope_deg: parseFloat(document.getElementById('param-slope').value),
          soil_moisture_pct: parseFloat(document.getElementById('param-moisture').value),
          geology_condition: document.getElementById('param-geology').value,
          ndvi: parseFloat(document.getElementById('param-ndvi').value),
          land_cover: document.getElementById('param-landcover').value,
          window_hours: parseInt(document.getElementById('param-window').value, 10)
        };

        state.assessmentParams = updatedParams;
        state.activeLocationTarget = {
          name: updatedParams.location_name,
          lat: updatedParams.latitude,
          lon: updatedParams.longitude
        };
        state.processingLocationName = updatedParams.location_name;

        router.navigate('processing');
      };
    }
  }
};

export default RiskAssessmentView;
