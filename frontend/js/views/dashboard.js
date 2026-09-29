/**
 * TerraGuard AI - Operations Dashboard View (Vanilla JS)
 * High-level situational awareness, corridor monitoring metrics,
 * historical database coverage, and telemetry snapshot.
 */
import api from '../api.js';
import { WeatherCardComponent } from '../components/weather-card.js';

export const DashboardView = {
  render(container, state, router) {
    const loc = state.activeLocationTarget || {
      name: "Wayanad Vythiri Ghats",
      lat: 11.5540,
      lon: 76.0422
    };

    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Header -->
        <div class="glass-panel" style="padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem; margin: 0 0 4px 0; color: #FFFFFF;">Disaster Operations Command Dashboard</h1>
            <span style="font-size: 0.82rem; color: var(--text-muted);">
              Real-time corridor monitoring, geotechnical telemetry integration, and AI early warning status.
            </span>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="dash-quick-eval-btn" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 6px;">
              ⚡ Run Assessment
            </button>
            <button id="dash-gis-map-btn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
              🗺️ GIS Map
            </button>
          </div>
        </div>

        <!-- 4 Key Stat Metrics -->
        <div class="grid-4">
          <div class="glass-panel" style="padding: 20px;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">HISTORICAL CATALOG</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: #FFFFFF; margin: 6px 0;">165</div>
            <span style="font-size: 0.75rem; color: var(--emerald-400);">Verified GSI & NASA records</span>
          </div>

          <div class="glass-panel" style="padding: 20px;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">ACTIVE CORRIDORS</div>
            <div id="dash-corridors-count" style="font-size: 2.2rem; font-weight: 800; color: #38BDF8; margin: 6px 0;">6</div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Key hillside transit routes</span>
          </div>

          <div class="glass-panel" style="padding: 20px;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">AI INFERENCE ENGINE</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: #A78BFA; margin: 6px 0;">Layer 2</div>
            <span style="font-size: 0.75rem; color: var(--emerald-400);">RandomForest (120 Trees)</span>
          </div>

          <div class="glass-panel" style="padding: 20px;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">LLM EXPLAINABILITY</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: #F59E0B; margin: 6px 0;">Gemini</div>
            <span style="font-size: 0.75rem; color: var(--sky-400);">Multilingual Alert Dispatch</span>
          </div>
        </div>

        <!-- Live Weather Component -->
        <div id="dashboard-weather-container"></div>

        <!-- Monitored Corridors Table -->
        <div class="glass-panel" style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 1.15rem; color: #FFFFFF;">
            High-Risk Hillside Corridor Monitoring Matrix
          </h3>
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Corridor Name</th>
                  <th>Region</th>
                  <th>Slope</th>
                  <th>Geology</th>
                  <th>Active Risk Class</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="dash-corridors-tbody">
                <tr>
                  <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
                    Loading corridor telemetry...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // 1. Mount Weather Card
    const weatherComp = new WeatherCardComponent('dashboard-weather-container', {
      lat: loc.lat,
      lon: loc.lon,
      locationName: loc.name
    });
    weatherComp.mount();

    // 2. Fetch Corridor Telemetry
    api.getCorridorMonitoring().then(res => {
      const tbody = document.getElementById('dash-corridors-tbody');
      const countEl = document.getElementById('dash-corridors-count');
      if (!tbody) return;

      const list = res.corridors || [
        { name: "Wayanad Vythiri Ghats", region: "Western Ghats, Kerala", slope: "38.5°", geology: "Weak", risk_class: "CRITICAL", lat: 11.5540, lon: 76.0422 },
        { name: "Joshimath Subsidence Ridge", region: "Chamoli, Uttarakhand", slope: "42.0°", geology: "Weak", risk_class: "CRITICAL", lat: 30.5564, lon: 79.5663 },
        { name: "Malin Hills Escarpment", region: "Pune Ghats, Maharashtra", slope: "36.0°", geology: "Weak", risk_class: "HIGH", lat: 19.1608, lon: 73.6827 },
        { name: "Nilgiris Coonoor Slopes", region: "Nilgiri Hills, Tamil Nadu", slope: "28.0°", geology: "Moderate", risk_class: "MODERATE", lat: 11.3530, lon: 76.7959 },
        { name: "Darjeeling Lebong Spur", region: "Eastern Himalayas, West Bengal", slope: "34.0°", geology: "Weak", risk_class: "HIGH", lat: 27.0410, lon: 88.2663 },
        { name: "Kopargaon Escarpment", region: "Ahmednagar, Maharashtra", slope: "4.5°", geology: "Stable", risk_class: "LOW", lat: 19.8833, lon: 74.4833 }
      ];

      if (countEl) countEl.textContent = list.length;

      tbody.innerHTML = list.map(c => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td style="color: var(--text-secondary);">${c.region}</td>
          <td>${c.slope || c.slope_deg + '°'}</td>
          <td><span style="font-size: 0.8rem; color: var(--text-muted);">${c.geology || 'Moderate'}</span></td>
          <td>
            <span class="badge ${c.risk_class === 'CRITICAL' ? 'badge-crit' : (c.risk_class === 'HIGH' ? 'badge-high' : (c.risk_class === 'MODERATE' ? 'badge-mod' : 'badge-low'))}">
              ${c.risk_class}
            </span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm eval-corridor-btn" data-lat="${c.lat || c.latitude}" data-lon="${c.lon || c.longitude}" data-name="${c.name}" data-region="${c.region}">
              ⚡ Assess
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.eval-corridor-btn').forEach(btn => {
        btn.onclick = () => {
          state.activeLocationTarget = {
            name: btn.dataset.name,
            region: btn.dataset.region,
            lat: parseFloat(btn.dataset.lat),
            lon: parseFloat(btn.dataset.lon)
          };
          state.processingLocationName = btn.dataset.name;
          router.navigate('processing');
        };
      });
    }).catch(() => {});

    // Quick Action buttons
    const qBtn = document.getElementById('dash-quick-eval-btn');
    if (qBtn) qBtn.onclick = () => router.navigate('assessment');

    const mBtn = document.getElementById('dash-gis-map-btn');
    if (mBtn) mBtn.onclick = () => router.navigate('map');
  }
};

export default DashboardView;
