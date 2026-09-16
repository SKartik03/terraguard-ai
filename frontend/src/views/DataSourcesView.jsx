import React, { useState } from 'react';
import { Database, Satellite, CloudRain, Mountain, ShieldCheck, ExternalLink, CheckCircle2, Layers, Filter } from 'lucide-react';

export default function DataSourcesView() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const sources = [
    // 1. Terrain / DEM
    {
      name: "NASA SRTM 30m Global DEM",
      category: "Terrain (DEM)",
      url: "https://earthengine.google.com",
      status: "Verified Geospatial Layer",
      badgeClass: "badge-info",
      resolution: "1-arcsecond (~30m Ground Pixel)",
      provider: "NASA JPL / Google Earth Engine",
      description: "Primary topographical digital elevation model supplying slope angles (θ), elevation contours, and drainage basin curvature across all monitored mountain ranges.",
      coverage: "Global (60°N to 56°S)"
    },
    {
      name: "ISRO Cartosat DEM (Bhuvan)",
      category: "Terrain (DEM)",
      url: "https://bhuvan.nrsc.gov.in",
      status: "National Geospatial Standard",
      badgeClass: "badge-info",
      resolution: "10m – 30m High Resolution",
      provider: "National Remote Sensing Centre (NRSC) / ISRO",
      description: "Indian stereo-optical elevation models specifically utilized for high-gradient Himalayan and Western Ghats slope stability analysis and micro-watershed boundary extraction.",
      coverage: "Pan-India Territory"
    },

    // 2. Rainfall & Weather
    {
      name: "IMD Mausam Portal",
      category: "Rainfall / Weather",
      url: "https://mausam.imd.gov.in",
      status: "National Meteorological Standard",
      badgeClass: "badge-info",
      resolution: "District / Station Level",
      provider: "India Meteorological Department (Ministry of Earth Sciences)",
      description: "Official real-time meteorological warnings, district rainfall alerts (Orange / Red / Yellow alerts), and telemetric automated weather station (AWS) rainfall statistics.",
      coverage: "All Indian States & Union Territories"
    },
    {
      name: "IMD Pune Gridded Rainfall (0.25° NetCDF)",
      category: "Rainfall / Weather",
      url: "https://imdpune.gov.in/cmpg/Griddata/Rainfall_25_NetCDF.html",
      status: "Historical Climate Benchmark",
      badgeClass: "badge-info",
      resolution: "0.25° × 0.25° Spatial Grid (~25km)",
      provider: "IMD Climate Monitoring & Prediction Group, Pune",
      description: "Daily high-resolution gridded rainfall NetCDF archives spanning 1901–present. Powers the historical rainfall benchmark thresholds and antecedent moisture accumulation calculations.",
      coverage: "Continental India & Island Belts"
    },
    {
      name: "Open-Meteo Real-Time Weather & Forecast API",
      category: "Rainfall / Weather",
      url: "https://open-meteo.com",
      status: "Live Active Telemetry",
      badgeClass: "badge-low",
      resolution: "Point Grid (1km – 3km High Frequency)",
      provider: "Open-Meteo / ECMWF / DWD Open Data",
      description: "Provides live real-time hourly rainfall accumulation, 24-hour forecast sums, and relative humidity directly feeding the live corridor monitoring table and live assessment engine.",
      coverage: "Global Real-Time (No API Key Required)"
    },

    // 3. Soil Moisture
    {
      name: "NASA SMAP (Soil Moisture Active Passive)",
      category: "Soil Moisture",
      url: "https://earthengine.google.com",
      status: "Remote Sensing Index",
      badgeClass: "badge-info",
      resolution: "9km – 36km L-band Radiometer",
      provider: "NASA Earth Science / Google Earth Engine",
      description: "Satellite-derived surface soil moisture (top 5 cm) measuring volume percentage of moisture saturation. Informs the subsoil liquefaction potential factor in the risk matrix.",
      coverage: "Global 2–3 Day Revisit"
    },
    {
      name: "NASA GLDAS Hydrological Land Data",
      category: "Soil Moisture",
      url: "https://earthengine.google.com",
      status: "Hydrological Reanalysis",
      badgeClass: "badge-info",
      resolution: "0.25° Gridded Land Surface",
      provider: "NASA GSFC / NOAA NCEP",
      description: "Global Land Data Assimilation System combining satellite observations with energy balance models to simulate multi-layer root-zone soil saturation.",
      coverage: "Global Continuous"
    },

    // 4. Vegetation (NDVI)
    {
      name: "Copernicus Sentinel-2 MSI (Level-2A BOA)",
      category: "Vegetation (NDVI)",
      url: "https://earthengine.google.com",
      status: "Calibrated Optical Surface",
      badgeClass: "badge-info",
      resolution: "10m Red & Near-Infrared Bands",
      provider: "European Space Agency (ESA) / Google Earth Engine",
      description: "Bottom-of-Atmosphere optical reflectances used to compute Normalized Difference Vegetation Index (NDVI). Calibrates the biotechnical soil-root shear reinforcement factor.",
      coverage: "Global 5-Day Revisit"
    },

    // 5. Landslide Inventories (Ground-Truth Labels)
    {
      name: "GSI Bhukosh Public Geoportal",
      category: "Landslide Inventory",
      url: "https://bhukosh.gsi.gov.in/Bhukosh/Public",
      status: "Official Geological Archive",
      badgeClass: "badge-info",
      resolution: "1:50,000 Geological Mapping",
      provider: "Geological Survey of India (GSI)",
      description: "India's baseline spatial geodatabase detailing lithology, shear zones, active fault planes, and comprehensive historical landslide point attributes.",
      coverage: "National Geological Coverage"
    },
    {
      name: "GSI Bhusanket Landslide Early Warning Portal",
      category: "Landslide Inventory",
      url: "https://bhusanket.gsi.gov.in",
      status: "National Early Warning Pilot",
      badgeClass: "badge-info",
      resolution: "Regional Catchment Units",
      provider: "Geological Survey of India (GSI) Landslide Division",
      description: "Operational landslide susceptibility maps, experimental rainfall threshold corridors, and verified field incident archives for mountain districts.",
      coverage: "Select Mountain Districts (Wayanad, Nilgiris, Uttarakhand)"
    },
    {
      name: "ISRO Landslide Atlas of India",
      category: "Landslide Inventory",
      url: "https://www.isro.gov.in/Landslide_Atlas_India.html",
      status: "National Benchmark Report",
      badgeClass: "badge-info",
      resolution: "1:50,000 Macro & Micro Corridors",
      provider: "National Remote Sensing Centre (NRSC) / ISRO",
      description: "Official comprehensive atlas ranking India's 147 landslide-prone districts across Western Ghats and Himalayas. Forms the empirical risk distribution baseline.",
      coverage: "17 States & 2 Union Territories"
    },
    {
      name: "NRSC Bhuvan Disaster Management Portal",
      category: "Landslide Inventory",
      url: "https://bhuvan-app1.nrsc.gov.in/disaster/disaster.php?id=landslide",
      status: "Emergency Response Geoportal",
      badgeClass: "badge-info",
      resolution: "Rapid Satellite Event Scars",
      provider: "Disaster Management Support Programme, NRSC/ISRO",
      description: "Rapid post-disaster high-resolution optical mapping of active landslide scars, debris flow runouts, and river impoundment dams following extreme precipitation spells.",
      coverage: "Event-Triggered Disaster Corridors"
    },
    {
      name: "NASA Global Landslide Catalog (NASA GLC)",
      category: "Landslide Inventory",
      url: "https://data.humdata.org/dataset/global-landslide-catalogue-nasa",
      status: "Global Benchmark Dataset",
      badgeClass: "badge-info",
      resolution: "Point Coordinates + Impact Metrics",
      provider: "NASA Goddard Space Flight Center (GSFC) / HDX",
      description: "Standardized global catalog of rainfall-triggered landslide events with documented fatalities, damage estimates, trigger rain events, and spatial coordinates.",
      coverage: "Global Event Archive"
    },
    {
      name: "India Recent Incidents Landslide Dataset",
      category: "Landslide Inventory",
      url: "https://www.kaggle.com/datasets/kkhandekar/lanslide-recent-incidents-india",
      status: "Curated ML Benchmark",
      badgeClass: "badge-info",
      resolution: "Tabular Event Records",
      provider: "Kaggle Open Data Repository",
      description: "Curated tabular compilation of recent landslide occurrences across India, providing verified coordinates, slope classes, trigger descriptions, and damage metrics.",
      coverage: "India Regional Landslides"
    }
  ];

  const categories = ['ALL', 'Terrain (DEM)', 'Rainfall / Weather', 'Soil Moisture', 'Vegetation (NDVI)', 'Landslide Inventory'];

  const filteredSources = selectedCategory === 'ALL' 
    ? sources 
    : sources.filter(s => s.category === selectedCategory);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Authoritative Data Sources & Geodatabase Inventory</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Transparent documentation, links, and integration specifications for all official Indian (GSI, ISRO, IMD) and global (NASA, ESA, Open-Meteo) repositories.
        </p>
      </div>

      {/* Scope Banner */}
      <div className="scope-banner" style={{ marginBottom: 24 }}>
        <ShieldCheck className="scope-banner-icon" size={22} color="var(--emerald-400)" />
        <div>
          <strong style={{ color: 'var(--emerald-400)' }}>Governance & Data Integrity:</strong> TerraGuard AI relies on real geospatial, meteorological, and geological standards. Live weather is ingested directly from the Open-Meteo API, while digital elevation, soil moisture, and landslide labels are calibrated against official GSI, ISRO, IMD, NASA, and Copernicus datasets.
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem' }}
          >
            {cat} {cat === 'ALL' ? `(${sources.length})` : `(${sources.filter(s => s.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Sources Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredSources.map((src, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{src.name}</h3>
                  <span className={`badge ${src.badgeClass}`}>{src.status}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--emerald-400)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {src.category}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--sky-400)' }}>
                  Authority / Provider: <strong>{src.provider}</strong>
                </div>
              </div>
              <a 
                href={src.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>Visit Portal</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
              {src.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: 8, fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Spatial Resolution:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{src.resolution}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Coverage:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{src.coverage}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Repository URL:</span>
                <div style={{ fontWeight: 600, color: 'var(--sky-400)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {src.url}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
