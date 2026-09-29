/**
 * TerraGuard AI - Data Sources & Provenance View (Vanilla JS)
 * Comprehensive documentation of scientific catalogs, satellite telemetry, and update intervals.
 */
export const DataSourcesView = {
  render(container) {
    const sources = [
      {
        name: "Geological Survey of India (GSI) Bhukosh / Bhusanket",
        type: "National Historical Landslide Inventory",
        coverage: "All major landslide-prone zones in India",
        update: "Periodic official portal updates",
        records: "165 verified ground-truthed disaster records",
        desc: "Primary source for landslide incident locations, trigger rainfall dates, and geotechnical descriptions across the Western Ghats and Himalayas.",
        badge: "Official Government Portal"
      },
      {
        name: "NASA Global Landslide Catalog (GLC)",
        type: "Global Satellite Rain-Triggered Landslide Dataset",
        coverage: "Pan-India & Global Tropics",
        update: "Continuous satellite cataloging",
        records: "Severe rainfall-induced mudslide incidents",
        desc: "Catalog maintained by NASA Goddard Space Flight Center identifying rainfall-triggered landslides reported in media and scientific papers.",
        badge: "NASA Open Science"
      },
      {
        name: "NRSC / ISRO Landslide Atlas of India",
        type: "National Remote Sensing Geospatial Database",
        coverage: "17 States & 2 Union Territories in India",
        update: "ISRO Bhuvan Spatial Data Framework",
        records: "High-resolution satellite scarring mappings",
        desc: "Comprehensive remote sensing atlas tracking landslide susceptibility, lineament intersections, and drainage density indices.",
        badge: "ISRO Space Application"
      },
      {
        name: "Open-Meteo High-Resolution Weather & DEM Telemetry",
        type: "Real-Time Meteorological & Elevation Proxy",
        coverage: "Global (0.01° resolution, approx. 1.1 km grid)",
        update: "Hourly numerical weather prediction (NWP)",
        records: "Real-time precipitation, soil moisture, and DEM slope",
        desc: "Provides real-time precipitation volume, 24h forecast accumulation, temperature, and Copernicus DEM 30m digital elevation slope derivation.",
        badge: "Live Telemetry Proxy"
      },
      {
        name: "Google Gemini 2.5 Flash API",
        type: "Multimodal Foundation Model & Explainability Engine",
        coverage: "Natural Language Synthesis & Regional Indian Languages",
        update: "On-demand live API invocation",
        records: "Explainable risk narratives & multilingual civil alerts",
        desc: "Synthesizes transparent, non-technical reasoning grounded strictly in calculated geotechnical metrics and generates civil alerts in Hindi, Malayalam, Bengali, etc.",
        badge: "Google Gemini Theme"
      }
    ];

    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <div class="glass-panel" style="padding: 24px;">
          <h1 style="font-size: 1.8rem; margin: 0 0 6px 0; color: #FFFFFF;">Data Sources & Provenance Architecture</h1>
          <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0; line-height: 1.5;">
            TerraGuard AI adheres to strict data provenance standards. Every risk score, historical point, 
            and atmospheric metric is traced to verified national catalogs and live telemetry feeds.
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${sources.map(s => `
            <div class="glass-panel" style="padding: 22px 24px; border-left: 4px solid var(--emerald-500);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <div>
                  <span class="badge badge-low" style="font-size: 0.72rem; margin-bottom: 6px; display: inline-block;">
                    ${s.badge}
                  </span>
                  <h3 style="margin: 0; font-size: 1.15rem; color: #FFFFFF;">${s.name}</h3>
                  <span style="font-size: 0.8rem; color: var(--sky-400);">${s.type}</span>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted); background: rgba(15, 23, 42, 0.6); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                  ${s.update}
                </span>
              </div>
              <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.5; margin: 10px 0 12px 0;">
                ${s.desc}
              </p>
              <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 16px; flex-wrap: wrap;">
                <span>Coverage: <strong style="color: var(--text-primary);">${s.coverage}</strong></span>
                <span>Dataset Volume: <strong style="color: var(--emerald-400);">${s.records}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }
};

export default DataSourcesView;
