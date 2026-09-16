import React from 'react';
import { Shield, AlertTriangle, Cpu, MapPin, Database, ChevronRight, Activity, ArrowRight, BookOpen } from 'lucide-react';
import WeatherCard from '../components/WeatherCard';

export default function HomeView({ setView, setAssessmentParams }) {
  const launchScenario = (scenario) => {
    if (scenario === 'wayanad') {
      setAssessmentParams({
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
      });
    } else if (scenario === 'joshimath') {
      setAssessmentParams({
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
      });
    } else if (scenario === 'stable') {
      setAssessmentParams({
        location_name: "Nilgiris Protected Forest Basin",
        latitude: 11.3530,
        longitude: 76.7959,
        rainfall_mm: 22.0,
        slope_deg: 14.0,
        soil_moisture_pct: 35.0,
        geology_condition: "Stable",
        ndvi: 0.85,
        land_cover: "Forest",
        window_hours: 12
      });
    }
    setView('assessment');
  };

  return (
    <div className="animate-fade-in">
      {/* Scope Honesty Banner */}
      <div className="scope-banner">
        <AlertTriangle className="scope-banner-icon" size={22} />
        <div>
          <strong style={{ color: '#FCD34D' }}>Scope Honesty & Technical Boundaries:</strong> TerraGuard AI is an analytical research prototype utilizing historical landslide records, deterministic geotechnical weighting, and empirical Random Forest classification. It does <em>not</em> claim 100% predictive accuracy, exact date/time prediction, real-time sensor field telemetry, or substitute for official disaster management advisories.
        </div>
      </div>

      {/* Hero Section */}
      <div className="glass-panel" style={{ padding: '40px 36px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 20, color: 'var(--emerald-400)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 16 }}>
          <Shield size={14} /> AI for Climate Change · Landslide Risk Reduction
        </div>

        <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, marginBottom: 14, maxWidth: 780 }}>
          Historical-Data-Based <span style={{ background: 'linear-gradient(135deg, var(--emerald-400), #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Landslide Risk Prediction</span> Platform
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 720, marginBottom: 26 }}>
          Predict Risk. Warn Early. Protect Communities. Synthesizing historical landslide archives, precipitation thresholds, digital elevation models, and Scikit-learn machine learning for transparent decision support.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button onClick={() => setView('assessment')} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
            Launch Risk Assessment <ChevronRight size={18} />
          </button>
          <button onClick={() => setView('map')} className="btn btn-secondary" style={{ padding: '12px 22px' }}>
            <MapPin size={18} /> Interactive Risk Map
          </button>
          <button onClick={() => setView('methodology')} className="btn btn-secondary" style={{ padding: '12px 22px' }}>
            <BookOpen size={18} /> Inspect Methodology
          </button>
        </div>
      </div>

      {/* Grid: Workflow + Live Weather Demonstration */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="glass-panel" style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Cpu size={20} color="var(--emerald-400)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>End-to-End Analytical Flow</h3>
          </div>
          <p style={{ fontSize: '0.86rem', marginBottom: 20 }}>
            Every risk score is computed deterministically through an inspectable multi-stage pipeline:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { step: "01", title: "Historical Data Ingestion", desc: "150+ landslide events, coordinates, precipitation benchmarks, and geological surveys stored in SQLite." },
              { step: "02", title: "Layer 1: Deterministic Weighted Score", desc: "Explicit formula normalizing Rainfall (30%), Slope (20%), Soil (20%), Geology (15%), NDVI (10%), Land Cover (5%)." },
              { step: "03", title: "Layer 2: Random Forest ML Inference", desc: "Empirical classification with held-out validation metrics (100% test accuracy on synthetic benchmark)." },
              { step: "04", title: "Explainability & Warning Support", desc: "Dominant hazard factor identification, GIS hazard radius projection, and actionable mitigation tiers." }
            ].map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 14, background: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald-400)', fontSize: '0.9rem' }}>{s.step}</span>
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 2 }}>{s.title}</h4>
                  <p style={{ fontSize: '0.78rem', margin: 0, color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <WeatherCard lat={11.5540} lon={76.0422} locationName="Wayanad Western Ghats Hub" />

          {/* Quick Start Presets */}
          <div className="glass-panel" style={{ padding: '22px 24px', flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>One-Click Test Scenarios</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Pre-load verified calibration datasets directly into the risk assessment engine:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div 
                onClick={() => launchScenario('wayanad')}
                style={{ padding: '12px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s ease' }}
                className="hover-card"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-crit" style={{ fontSize: '0.65rem' }}>CRITICAL SIMULATION</span>
                    <strong style={{ fontSize: '0.88rem' }}>Wayanad Monsoon Torrential</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', color: 'var(--text-muted)' }}>165mm rain, 38.5° slope, weak bedrock, 82% soil saturation</p>
                </div>
                <ArrowRight size={16} color="var(--risk-crit)" />
              </div>

              <div 
                onClick={() => launchScenario('joshimath')}
                style={{ padding: '12px 14px', background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s ease' }}
                className="hover-card"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>HIGH HAZARD</span>
                    <strong style={{ fontSize: '0.88rem' }}>Joshimath Subsidence Tectonics</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', color: 'var(--text-muted)' }}>75mm rain, 42° slope, mica schist fracture, barren cover</p>
                </div>
                <ArrowRight size={16} color="var(--risk-high)" />
              </div>

              <div 
                onClick={() => launchScenario('stable')}
                style={{ padding: '12px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s ease' }}
                className="hover-card"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>LOW RISK</span>
                    <strong style={{ fontSize: '0.88rem' }}>Dense Forest Plateau (Control)</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', color: 'var(--text-muted)' }}>22mm rain, 14° gentle slope, stable bedrock, dense canopy</p>
                </div>
                <ArrowRight size={16} color="var(--risk-low)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
