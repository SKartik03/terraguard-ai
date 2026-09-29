import React from 'react';
import { BookOpen, Cpu, Shield, Calculator, CheckCircle2, Award, ArrowDown, Layers, AlertTriangle } from 'lucide-react';

export default function MethodologyView() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Engineering Methodology & Location-First Analytical Logic</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Transparent documentation of the location-first pipeline, Mode A / Mode B dual architecture, dynamic weight normalization, and geotechnical weighting.
        </p>
      </div>

      {/* Section 29: Location-First Pipeline Flowchart */}
      <div className="glass-panel" style={{ padding: '26px 28px', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={20} color="var(--emerald-400)" /> End-to-End Location-First Pipeline
        </h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          TerraGuard AI operates as a location-first assessment platform rather than a manual number-entry form:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640, margin: '0 auto' }}>
          {[
            { step: "User Location", desc: "Browser Geolocation API (navigator.geolocation), text search, or interactive click-on-map coordinate pick." },
            { step: "Location Identification", desc: "Reverse geocoding to identify municipal name, administrative state, and regional mountain belt." },
            { step: "Historical Landslide Search", desc: "Haversine spherical distance scan against 150+ verified events within a 25 km radius." },
            { step: "Current Environmental Data", desc: "Live Open-Meteo precipitation, 24h forecast, temperature, and atmospheric humidity telemetry." },
            { step: "Geographic Factors", desc: "Digital elevation model slope inclination, bedrock lithology, and calibrated NDVI vegetation density." },
            { step: "Data Availability Check", desc: "Verification of factor statuses (Current, Geographic, Estimated, Historical, Unavailable)." },
            { step: "Risk Calculation (Dynamic Normalization)", desc: "Mode A (Historical + Current) or Mode B (Current-Condition Only) with dynamic weight re-scaling." },
            { step: "Explainable Assessment", desc: "Grounded justification of dominant hazard drivers without unscientific certainty claims." },
            { step: "Map + Result", desc: "Spatial projection of selected pin, 25km proximity buffer, nearby historical pins, and audit report." }
          ].map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <div style={{ 
                background: idx === 2 ? 'rgba(14, 165, 233, 0.12)' : (idx === 6 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.7)'), 
                border: `1px solid ${idx === 2 ? 'rgba(14, 165, 233, 0.35)' : (idx === 6 ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)')}`,
                borderRadius: 8, 
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14
              }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 700, 
                  color: 'var(--emerald-400)', 
                  fontSize: '0.85rem',
                  minWidth: 26
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.9rem', color: 'white' }}>{item.step}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
              {idx < arr.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
                  <ArrowDown size={14} color="var(--text-muted)" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Historical Records vs Current Conditions Evidence Distinction */}
      <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={20} color="var(--sky-400)" /> Separate Types of Evidence
        </h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
          A fundamental scientific tenet in TerraGuard AI is that <strong>historical records and current conditions represent distinct categories of evidence</strong>:
        </p>

        <div className="grid-2">
          <div style={{ background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)', borderRadius: 8, padding: '16px 18px' }}>
            <h4 style={{ color: 'var(--sky-400)', fontSize: '0.95rem', marginBottom: 6 }}>1. Historical Landslide Evidence</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Indicates empirical past slope failure under extreme weather in this terrain unit. Historical occurrence is <strong>evidence of past vulnerability</strong>, not certainty of future recurrence. Absence of historical records does <em>not</em> prove a slope is safe.
            </p>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, padding: '16px 18px' }}>
            <h4 style={{ color: 'var(--emerald-400)', fontSize: '0.95rem', marginBottom: 6 }}>2. Current Environmental & Geographic Conditions</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Represents immediate meteorological triggers (real-time rainfall, soil pore-water saturation, slope steepness). Elevated current rainfall on a steep slope presents high hazard even if no past landslides were recorded in the dataset.
            </p>
          </div>
        </div>
      </div>

      {/* Mode A vs Mode B Architecture */}
      <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 10 }}>Dual Analysis Modes (Mode A & Mode B)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 14 }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: '18px' }}>
            <span className="badge badge-low" style={{ marginBottom: 10 }}>MODE A</span>
            <h4 style={{ fontSize: '1rem', margin: '6px 0' }}>Historical + Current Assessment</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Triggered when historical landslide events exist within 25 km. Synthesizes proximity, density, and recency of past failures together with live rainfall and slope characteristics.
            </p>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, padding: '18px' }}>
            <span className="badge badge-mod" style={{ marginBottom: 10 }}>MODE B</span>
            <h4 style={{ fontSize: '1rem', margin: '6px 0' }}>Current-Condition Only Assessment</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Triggered when zero historical records exist in dataset. Transparently states that no history was found, excludes the historical weight, and normalizes remaining current environmental and geographic factors without claiming zero risk.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Weight Normalization Formula */}
      <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calculator size={20} color="var(--emerald-400)" /> Dynamic Missing Factor Weight Normalization
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          If a factor is unavailable (e.g. historical data in Mode B, or missing sensor telemetry), TerraGuard AI <strong>never substitutes zero</strong> (which would falsely deflate risk). Instead, it dynamically re-weights available factors:
        </p>

        <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px 18px', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--sky-400)', marginBottom: 18, border: '1px solid var(--border-subtle)' }}>
          w_i' = w_i / Σ(w_k for all available factors k)<br />
          raw_score = Σ(normalized_factor_i × w_i') × 100<br />
          final_score = min(raw_score × window_multiplier, 100.0)
        </div>

        {/* Prototype Base Weights Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>Base Prototype Weight</th>
                <th>Data Status</th>
                <th>Physical Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Rainfall Volume</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>25% (0.25)</td>
                <td>Current (Open-Meteo)</td>
                <td>Primary trigger; pore pressure buildup reduces effective shear strength.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Slope Angle</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>20% (0.20)</td>
                <td>Geographic (DEM)</td>
                <td>Gravitational shear stress increases exponentially on steep slopes.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Soil Moisture</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>15% (0.15)</td>
                <td>Estimated / Satellite</td>
                <td>Antecedent moisture accelerates liquefaction threshold under rainfall.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Geological Bedrock</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>15% (0.15)</td>
                <td>Geographic (GSI Lithology)</td>
                <td>Fissured schists and weathered phyllites exhibit high slip vulnerability.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Historical Evidence</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>15% (0.15)</td>
                <td>Historical (25 km radius)</td>
                <td>Verified past occurrences indicate localized geological instability.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Vegetation (NDVI)</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>5% (0.05)</td>
                <td>Prototype (Sentinel-2)</td>
                <td>Root networks bind soil strata; deforested or barren slopes elevate risk.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Land Cover</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)' }}>5% (0.05)</td>
                <td>Geographic</td>
                <td>Canopy intercepts storm rainfall; urban cut-slopes increase destabilization.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scope Boundaries & Cautious Language */}
      <div style={{ padding: '16px 20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <AlertTriangle size={22} color="var(--risk-crit)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: '#FCA5A5', display: 'block', marginBottom: 4 }}>Ethical Scope & Prediction Honesty:</strong>
          TerraGuard AI is a decision-support prototype. It does <em>not</em> claim 100% certainty, "guaranteed safety", or deterministic occurrence timing. The model output is a <strong>0–100 susceptibility score</strong>, not an empirical probability. Official disaster response must always follow directives from authorized disaster-management agencies.
        </div>
      </div>

    </div>
  );
}
