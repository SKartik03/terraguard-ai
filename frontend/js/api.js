/**
 * TerraGuard AI - Unified API Client
 * Centralizes all HTTP communication with the FastAPI backend.
 * Handles environment-based URL resolution (local development vs production).
 */

const getApiBaseUrl = () => {
  // 1. Explicit window override
  if (typeof window !== 'undefined' && window.TERRAGUARD_API_BASE) {
    return window.TERRAGUARD_API_BASE.replace(/\/$/, '');
  }

  // 2. Local development fallback (when opening index.html via file:// or local static server without proxy)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const port = window.location.port;
    if (window.location.protocol === 'file:') {
      return 'http://127.0.0.1:8000';
    }
    if ((host === 'localhost' || host === '127.0.0.1') && port !== '8000') {
      // Local dev server (e.g. Vite, Live Server, Python http.server)
      return 'http://127.0.0.1:8000';
    }
  }

  // 3. Deployed production (e.g. Vercel with rewrites to Render backend)
  return '';
};

const API_BASE = getApiBaseUrl();

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errDetail = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errDetail = errorJson.detail || errorJson.error || errorJson.message || errDetail;
      } catch (_) {}
      const err = new Error(typeof errDetail === 'string' ? errDetail : JSON.stringify(errDetail));
      err.status = response.status;
      err.response = response;
      throw err;
    }
    return await response.json();
  } catch (error) {
    console.warn(`TerraGuard API call failed [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Platform Health & Status
  getHealth: () => request('/api/health'),
  getSystemStatus: () => request('/api/system-status'),

  // Locations & Geocoding
  getLocations: () => request('/api/locations'),
  geocode: (query) => request(`/api/geocode?q=${encodeURIComponent(query)}`),
  reverseGeocode: (lat, lon) => request(`/api/reverse-geocode?lat=${lat}&lon=${lon}`),

  // Master Location Analysis (Mode A / Mode B with Gemini Explanation)
  analyzeLocation: (lat, lon, radiusKm = 25, forceRefresh = false) =>
    request(`/api/location/analyze?lat=${lat}&lon=${lon}&radius_km=${radiusKm}${forceRefresh ? '&force_refresh=true' : ''}`),

  // Gemini Multilingual Alert Dispatch (Feature B)
  getAlertDispatch: (lat, lon, language = 'en', radiusKm = 25) =>
    request(`/api/location/alert-dispatch?lat=${lat}&lon=${lon}&language=${encodeURIComponent(language)}&radius_km=${radiusKm}`),

  // Deterministic Risk Assessment (POST form calculation)
  calculateRisk: (params) =>
    request('/api/risk', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Historical Incidents
  getHistoricalEvents: (limit = 100, landslideOnly = true, state = null) => {
    let url = `/api/historical-events?limit=${limit}&landslide_only=${landslideOnly}`;
    if (state) url += `&state=${encodeURIComponent(state)}`;
    return request(url);
  },
  getNearbyEvents: (lat, lon, radiusKm = 25) =>
    request(`/api/historical-events/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`),
  getSchedulerStatus: () => request('/api/historical-events/scheduler-status'),
  triggerSyncNow: () => request('/api/historical-events/sync-now', { method: 'POST' }),

  // Weather & GIS Telemetry
  getRiskMap: () => request('/api/risk-map'),
  getLiveWeather: (lat, lon) => request(`/api/live-weather?lat=${lat}&lon=${lon}`),
  getLiveWeatherAssessment: (lat, lon) => request(`/api/live-weather-assessment?lat=${lat}&lon=${lon}`),
  getCorridorMonitoring: () => request('/api/live-corridor-monitoring'),
};

export default api;
