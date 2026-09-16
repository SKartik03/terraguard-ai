import React from 'react';
import { Database, Satellite, CloudRain, Mountain, ShieldCheck, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DataSourcesView() {
  const sources = [
    {
      name: "Geological Survey of India & NASA GLC Landslide Archive",
      category: "Ground-Truth Landslide Events",
      status: "Static Historical Benchmark",
      badgeClass: "badge-info",
      resolution: "Point & Polygon Centroids",
      updateCadence: "Pre-loaded SQLite Seed",
      description: "Historical repository of major landslide occurrences across Western Ghats, Uttarakhand, Himachal Pradesh, and Sikkim. Supplies the empirical training labels (landslide vs non-landslide controls).",
      coverage: "Pan-India Mountain Belts",
      verified: true
    },
    {
      name: "NASA Shuttle Radar Topography Mission (SRTM DEM)",
      category: "Terrain Morphology & Slope",
      status: "Geospatial Benchmark",
      badgeClass: "badge-info",
      resolution: "1-arcsecond (~30m ground pixel)",
      updateCadence: "Static Surface Elevation",
      description: "Provides topographical slope angles, curvature, and elevation profiles. Used to derive the critical slope angle factor (45° normalization threshold).",
      coverage: "Global (60°N to 56°S)",
      verified: true
    },
    {
      name: "Copernicus Sentinel-2 MSI (Level-2A)",
      category: "Vegetation & Land Cover (NDVI)",
      status: "Calibrated Optical Index",
      badgeClass: "badge-info",
      resolution: "10m Multispectral Bands (B4 Red, B8 NIR)",
      updateCadence: "Calibrated Seasonal Baseline",
      description: "Vegetation cover density derived from Normalized Difference Vegetation Index (NDVI = (NIR - Red) / (NIR + Red)). Inverted in risk scoring where bare soil elevates hazard.",
      coverage: "Global High-Resolution",
      verified: true
    },
    {
      name: "Open-Meteo Weather API",
      category: "Atmospheric Telemetry",
      status: "Live Demonstration API",
      badgeClass: "badge-low",
      resolution: "Point Forecast Grid (1-3 km)",
      updateCadence: "Hourly Atmospheric Snapshot",
      description: "Fetches live demonstration precipitation, humidity, and wind speed. Demonstrates how live atmospheric feeds could plug into a future system; logically and visually segregated from historical ML models.",
      coverage: "Global (No API Key Required)",
      verified: true
    },
    {
      name: "USGS Global Lithological Map (GLiM) / GSI Lithology",
      category: "Bedrock & Subsurface Stability",
      status: "Static Geotechnical Baseline",
      badgeClass: "badge-info",
      resolution: "Regional Scale Polygon",
      updateCadence: "Decadal Geological Mapping",
      description: "Classifies bedrock competence into Stable (hard crystalline granites/basalts), Moderate (weathered sedimentary), and Weak (tectonically sheared schists, phyllites, clays).",
      coverage: "Regional Mountain Basins",
      verified: true
    }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Transparent Data Inventory</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Detailed audit of all datasets, satellites, digital elevation models, and APIs powering TerraGuard AI.
        </p>
      </div>

      {/* Honesty Callout */}
      <div className="scope-banner" style={{ marginBottom: 24 }}>
        <ShieldCheck className="scope-banner-icon" size={22} color="var(--emerald-400)" />
        <div>
          <strong style={{ color: 'var(--emerald-400)' }}>Data Governance & Honesty Guarantee:</strong> Every dataset in this prototype is labeled with complete transparency regarding its active role. Live APIs (Open-Meteo) provide atmospheric context only and do not masquerade as real-time predictive IoT feeds.
        </div>
      </div>

      {/* Sources Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sources.map((src, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{src.name}</h3>
                  <span className={`badge ${src.badgeClass}`}>{src.status}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--sky-400)' }}>
                  Category: {src.category}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald-400)', fontSize: '0.75rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Verified Schema
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              {src.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: 8, fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Spatial Resolution:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{src.resolution}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Ingestion Mechanism:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{src.updateCadence}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Geographic Coverage:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{src.coverage}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
