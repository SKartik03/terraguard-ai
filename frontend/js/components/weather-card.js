/**
 * TerraGuard AI - WeatherCard Component (Vanilla JS)
 * Displays atmospheric snapshot metrics with interactive live/offline resilience toggle.
 */
import api from '../api.js';

export class WeatherCardComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.lat = options.lat || 11.5540;
    this.lon = options.lon || 76.0422;
    this.locationName = options.locationName || "Western Ghats Baseline";
    this.forceOffline = false;
    this.loading = false;
    this.weather = null;
  }

  async fetchWeather() {
    this.loading = true;
    this.render();

    if (this.forceOffline) {
      setTimeout(() => {
        this.weather = {
          status: "fallback_offline",
          temperature: 23.4,
          relative_humidity: 86,
          precipitation_mm: 18.5,
          wind_speed_kmh: 14.2,
          weather_condition: "Showers (Offline Simulation)",
          source: "Offline Meteorological Baseline",
          disclaimer: "Live weather is for atmospheric demonstration only. Historical risk model operates independently."
        };
        this.loading = false;
        this.render();
      }, 300);
      return;
    }

    try {
      const data = await api.getLiveWeather(this.lat, this.lon);
      this.weather = data;
    } catch (err) {
      console.warn("Weather API fallback triggered:", err);
      this.weather = {
        status: "fallback_offline",
        temperature: 24.1,
        relative_humidity: 82,
        precipitation_mm: 12.0,
        wind_speed_kmh: 11.5,
        weather_condition: "Scattered Rain (Fallback)",
        source: "Cached Regional Baseline",
        disclaimer: "Network call unavailable. Showing regional atmospheric baseline."
      };
    } finally {
      this.loading = false;
      this.render();
    }
  }

  setLocation(lat, lon, name) {
    this.lat = lat;
    this.lon = lon;
    if (name) this.locationName = name;
    this.fetchWeather();
  }

  mount() {
    this.fetchWeather();
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const w = this.weather;
    const isLive = w && w.status === 'live';

    container.innerHTML = `
      <div class="glass-panel" style="padding: 18px 20px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.4rem;">🌧️</span>
            <div>
              <h4 style="font-size: 0.95rem; margin: 0; color: var(--text-primary);">Live Weather Telemetry</h4>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${this.locationName}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button 
              id="${this.containerId}-offline-btn"
              class="btn btn-secondary btn-sm"
              style="font-size: 0.7rem; padding: 4px 8px;"
              title="Toggle simulated network drop for resilience test"
            >
              ${this.forceOffline ? "Simulating Offline" : "Online (Open-Meteo)"}
            </button>
            <button 
              id="${this.containerId}-refresh-btn"
              class="btn btn-secondary btn-sm"
              style="padding: 5px 8px;"
              ${this.loading ? "disabled" : ""}
            >
              🔄
            </button>
          </div>
        </div>

        ${w ? `
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0;">
            <div style="background: rgba(15, 23, 42, 0.7); padding: 10px 12px; borderRadius: 8px;">
              <span style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                🌡️ Temp
              </span>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
                ${w.temperature != null ? w.temperature : '--'}°C
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.7); padding: 10px 12px; borderRadius: 8px;">
              <span style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                💧 Humidity
              </span>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--sky-400); margin-top: 2px;">
                ${w.relative_humidity != null ? w.relative_humidity : '--'}%
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.7); padding: 10px 12px; borderRadius: 8px;">
              <span style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                🌧️ Precip
              </span>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--emerald-400); margin-top: 2px;">
                ${w.precipitation_mm != null ? w.precipitation_mm : '0.0'} mm
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.7); padding: 10px 12px; borderRadius: 8px;">
              <span style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                💨 Wind
              </span>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
                ${w.wind_speed_kmh != null ? w.wind_speed_kmh : '--'} km/h
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: ${isLive ? 'var(--emerald-400)' : 'var(--risk-mod)'}; font-size: 12px;">
                ${isLive ? '🟢' : '🟡'}
              </span>
              <span style="color: ${isLive ? 'var(--emerald-400)' : 'var(--risk-mod)'}; font-weight: 500;">
                ${w.weather_condition} (${w.source})
              </span>
            </div>
            <span style="color: var(--text-muted); font-size: 0.68rem; font-style: italic;">
              Snapshot only · Historical ML operates separately
            </span>
          </div>
        ` : `
          <div style="text-align: center; padding: 24px; color: var(--text-muted);">
            Connecting to meteorological telemetry...
          </div>
        `}
      </div>
    `;

    // Attach button listeners
    const offBtn = document.getElementById(`${this.containerId}-offline-btn`);
    if (offBtn) {
      offBtn.onclick = () => {
        this.forceOffline = !this.forceOffline;
        this.fetchWeather();
      };
    }
    const refBtn = document.getElementById(`${this.containerId}-refresh-btn`);
    if (refBtn) {
      refBtn.onclick = () => this.fetchWeather();
    }
  }
}
