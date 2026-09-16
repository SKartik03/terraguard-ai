import React, { useState } from 'react';
import { Sliders, Shield, AlertCircle, RefreshCw, Zap, Check, MapPin, Clock } from 'lucide-react';

export default function RiskAssessmentView({ params, setParams, onRunAssessment }) {
  const [loading, setLoading] = useState(false);

  const presets = [
    {
      label: "Wayanad Monsoon (Critical)",
      data: {
        location_name: "Wayanad Vythiri Ghats",
        latitude: 11.5540,
        longitude: 76.0422,
        rainfall_mm: 165.0,
        slope_deg: 38.5,
        soil_moisture_pct: 82.0,
        geology_condition: "Weak",
        ndvi: 0.32,
        land_cover: "Barren",
        window_hours: 24
      }
    },
    {
      label: "Joshimath Subsidence (Critical)",
      data: {
        location_name: "Joshimath Subsidence Ridge",
        latitude: 30.5564,
        longitude: 79.5663,
        rainfall_mm: 75.0,
        slope_deg: 42.0,
        soil_moisture_pct: 64.0,
        geology_condition: "Weak",
        ndvi: 0.20,
        land_cover: "Barren",
        window_hours: 48
      }
    },
    {
      label: "Malin Hills Cloudburst (High)",
      data: {
        location_name: "Malin Hills Escarpment",
        latitude: 19.1608,
        longitude: 73.6827,
        rainfall_mm: 135.0,
        slope_deg: 36.0,
        soil_moisture_pct: 76.0,
        geology_condition: "Weak",
        ndvi: 0.35,
        land_cover: "Agriculture",
        window_hours: 24
      }
    },
    {
      label: "Nilgiris Coonoor (Moderate)",
      data: {
        location_name: "Nilgiris Coonoor Slopes",
        latitude: 11.3530,
        longitude: 76.7959,
        rainfall_mm: 65.0,
        slope_deg: 28.0,
        soil_moisture_pct: 48.0,
        geology_condition: "Moderate",
        ndvi: 0.65,
        land_cover: "Grassland",
        window_hours: 24
      }
    },
    {
      label: "Dry Protected Plain (Low)",
      data: {
        location_name: "Deccan Plateau Foothills",
        latitude: 13.0827,
        longitude: 77.5877,
        rainfall_mm: 15.0,
        slope_deg: 8.0,
        soil_moisture_pct: 25.0,
        geology_condition: "Stable",
        ndvi: 0.82,
        land_cover: "Forest",
        window_hours: 12
      }
    }
  ];

  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState(null);

  const applyPreset = (preset) => {
    setParams({ ...preset.data });
    setLiveFeedback(null);
  };

  const handleIngestLiveWeather = async () => {
    setFetchingWeather(true);
    try {
      const res = await fetch(`/api/live-weather-assessment?lat=${params.latitude}&lon=${params.longitude}`);
      if (!res.ok) throw new Error("Failed to fetch live weather");
      const data = await res.json();
      
      setParams(prev => ({
        ...prev,
        rainfall_mm: data.rainfall_mm,
        soil_moisture_pct: data.soil_moisture_pct
      }));

      setLiveFeedback({
        status: data.status,
        text: `Live Open-Meteo Ingested: ${data.rainfall_mm}mm precipitation, ${data.soil_moisture_pct}% soil saturation (${data.weather_condition}, ${data.temperature}°C).`
      });
    } catch (err) {
      console.warn("Live weather ingestion fallback:", err);
      setLiveFeedback({
        status: 'fallback',
        text: `Network unavailable. Regional baseline applied: ${params.rainfall_mm}mm rain.`
      });
    } finally {
      setFetchingWeather(false);
    }
  };

  // Local deterministic score estimation for live formula preview
  const estimateScore = () => {
    const rNorm = Math.min(Math.max(params.rainfall_mm, 0) / 150.0, 1.0);
    const sNorm = Math.min(Math.max(params.slope_deg, 0) / 45.0, 1.0);
    const mNorm = Math.min(Math.max(params.soil_moisture_pct, 0) / 80.0, 1.0);
    const gNorm = params.geology_condition === 'Weak' ? 1.0 : (params.geology_condition === 'Moderate' ? 0.5 : 0.0);
    const nNorm = 1.0 - Math.min(Math.max(params.ndvi, 0), 1.0);
    const lcMap = { Forest: 0.1, Grassland: 0.4, Agriculture: 0.5, Urban: 0.3, Barren: 0.9 };
    const lcNorm = lcMap[params.land_cover] || 0.5;

    const raw = (rNorm * 30 + sNorm * 20 + mNorm * 20 + gNorm * 15 + nNorm * 10 + lcNorm * 5);
    const winMults = { 6: 1.0, 12: 1.03, 24: 1.08, 48: 1.15, 72: 1.2 };
    const mult = winMults[params.window_hours] || 1.08;
    return Math.min(Math.round(raw * mult * 10) / 10, 100.0);
  };

  const estimated = estimateScore();

  const getEstBadge = (score) => {
    if (score >= 85) return <span className="badge badge-crit">CRITICAL PREDICTED</span>;
    if (score >= 70) return <span className="badge badge-high">HIGH HAZARD</span>;
    if (score >= 40) return <span className="badge badge-mod">MODERATE</span>;
    return <span className="badge badge-low">LOW RISK</span>;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Risk Assessment Engine</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Configure environmental, hydrological, and geotechnical parameters for dual-layer evaluation.
          </p>
        </div>
      </div>

      {/* Presets Bar & Live Weather Ingestion */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="var(--emerald-400)" /> Calibration Presets & Real-Time Ingestion
          </div>
          <button 
            onClick={handleIngestLiveWeather} 
            className="btn btn-sm"
            style={{ 
              background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
              color: 'white', 
              boxShadow: '0 0 12px rgba(14, 165, 233, 0.35)',
              fontSize: '0.78rem'
            }}
            disabled={fetchingWeather}
          >
            <Zap size={14} className={fetchingWeather ? "animate-spin" : ""} />
            {fetchingWeather ? "Fetching Live Telemetry..." : "Ingest Live Weather (Open-Meteo)"}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {presets.map((p, idx) => (
            <button 
              key={idx} 
              onClick={() => applyPreset(p)}
              className={`btn btn-sm ${params.location_name === p.data.location_name ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {liveFeedback && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: liveFeedback.status === 'live' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', border: `1px solid ${liveFeedback.status === 'live' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, fontSize: '0.78rem', color: liveFeedback.status === 'live' ? 'var(--emerald-400)' : 'var(--risk-mod)' }}>
            ✓ {liveFeedback.text}
          </div>
        )}
      </div>

      {/* Main Grid: Form Inputs + Live Preview Card */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="glass-panel" style={{ padding: '24px 26px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={18} color="var(--emerald-400)" /> Geotechnical & Hydrological Parameters
          </h3>

          {/* Location Name & Window */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Location / Corridor Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={params.location_name} 
                onChange={(e) => setParams({ ...params, location_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Window <span className="desc">Accumulation</span>
              </label>
              <select 
                className="form-control form-select"
                value={params.window_hours}
                onChange={(e) => setParams({ ...params, window_hours: Number(e.target.value) })}
              >
                <option value={6}>6 Hours (1.00x)</option>
                <option value={12}>12 Hours (1.03x)</option>
                <option value={24}>24 Hours (1.08x)</option>
                <option value={48}>48 Hours (1.15x)</option>
                <option value={72}>72 Hours (1.20x)</option>
              </select>
            </div>
          </div>

          {/* Coordinates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Latitude (°N)</label>
              <input 
                type="number" 
                step="0.0001"
                className="form-control" 
                value={params.latitude} 
                onChange={(e) => setParams({ ...params, latitude: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude (°E)</label>
              <input 
                type="number" 
                step="0.0001"
                className="form-control" 
                value={params.longitude} 
                onChange={(e) => setParams({ ...params, longitude: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Slider 1: Rainfall (30%) */}
          <div className="form-group">
            <div className="form-label">
              <span>Rainfall Accumulation (30% Weight)</span>
              <span className="desc">Threshold: 150mm = 1.0</span>
            </div>
            <div className="range-slider-container">
              <input 
                type="range" 
                min="0" 
                max="250" 
                step="1"
                className="range-slider"
                value={params.rainfall_mm}
                onChange={(e) => setParams({ ...params, rainfall_mm: parseFloat(e.target.value) })}
              />
              <span className="range-val-badge">{params.rainfall_mm} mm</span>
            </div>
          </div>

          {/* Slider 2: Slope (20%) */}
          <div className="form-group">
            <div className="form-label">
              <span>Terrain Slope Angle (20% Weight)</span>
              <span className="desc">Threshold: 45° = 1.0</span>
            </div>
            <div className="range-slider-container">
              <input 
                type="range" 
                min="0" 
                max="60" 
                step="0.5"
                className="range-slider"
                value={params.slope_deg}
                onChange={(e) => setParams({ ...params, slope_deg: parseFloat(e.target.value) })}
              />
              <span className="range-val-badge">{params.slope_deg}°</span>
            </div>
          </div>

          {/* Slider 3: Soil Moisture (20%) */}
          <div className="form-group">
            <div className="form-label">
              <span>Soil Moisture Saturation (20% Weight)</span>
              <span className="desc">Threshold: 80% = 1.0</span>
            </div>
            <div className="range-slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="1"
                className="range-slider"
                value={params.soil_moisture_pct}
                onChange={(e) => setParams({ ...params, soil_moisture_pct: parseFloat(e.target.value) })}
              />
              <span className="range-val-badge">{params.soil_moisture_pct}%</span>
            </div>
          </div>

          {/* Slider 4: NDVI (10%) */}
          <div className="form-group">
            <div className="form-label">
              <span>Vegetation Index - NDVI (10% Weight)</span>
              <span className="desc">Inverse: 0.0 (High Risk) → 1.0 (Low Risk)</span>
            </div>
            <div className="range-slider-container">
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.02"
                className="range-slider"
                value={params.ndvi}
                onChange={(e) => setParams({ ...params, ndvi: parseFloat(e.target.value) })}
              />
              <span className="range-val-badge">{params.ndvi.toFixed(2)}</span>
            </div>
          </div>

          {/* Geology & Land Cover Dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">
                Geological Condition (15%)
              </label>
              <select 
                className="form-control form-select"
                value={params.geology_condition}
                onChange={(e) => setParams({ ...params, geology_condition: e.target.value })}
              >
                <option value="Stable">Stable Bedrock (0.0)</option>
                <option value="Moderate">Moderate Stratum (0.5)</option>
                <option value="Weak">Weak / Fractured (1.0)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Land Cover (5%)
              </label>
              <select 
                className="form-control form-select"
                value={params.land_cover}
                onChange={(e) => setParams({ ...params, land_cover: e.target.value })}
              >
                <option value="Forest">Forest (0.1)</option>
                <option value="Grassland">Grassland (0.4)</option>
                <option value="Agriculture">Agriculture (0.5)</option>
                <option value="Urban">Urban / Built-up (0.3)</option>
                <option value="Barren">Barren / Cleared (0.9)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button 
              onClick={onRunAssessment} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              <Zap size={18} /> Execute Dual-Layer Risk Evaluation
            </button>
          </div>
        </div>

        {/* Live Preview / Formula Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-panel" style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Live Deterministic Preview</h3>
              {getEstBadge(estimated)}
            </div>

            <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estimated Layer 1 Score
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: estimated >= 70 ? 'var(--risk-crit)' : (estimated >= 40 ? 'var(--risk-mod)' : 'var(--risk-low)'), lineHeight: 1 }}>
                {estimated}
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                Window Multiplier: <strong>{params.window_hours}h</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Rainfall Factor:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{(Math.min(params.rainfall_mm / 150, 1) * 30).toFixed(1)} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Slope Angle Factor:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{(Math.min(params.slope_deg / 45, 1) * 20).toFixed(1)} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Soil Moisture Factor:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{(Math.min(params.soil_moisture_pct / 80, 1) * 20).toFixed(1)} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Geology Factor:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{(params.geology_condition === 'Weak' ? 15 : (params.geology_condition === 'Moderate' ? 7.5 : 0)).toFixed(1)} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>NDVI Vegetation Factor:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{((1 - Math.min(params.ndvi, 1)) * 10).toFixed(1)} pts</span>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 12, background: 'rgba(15, 23, 42, 0.7)', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Formula Rule:</strong> Final score uses exact weights. Same inputs guarantee identical outputs every execution.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
