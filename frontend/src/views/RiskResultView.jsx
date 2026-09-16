import React from 'react';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { Shield, AlertTriangle, CheckCircle, Download, ArrowLeft, MapPin, Cpu, BookOpen, AlertOctagon } from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function RiskResultView({ resultData, setView, onBackToAssessment }) {
  if (!resultData || !resultData.result) {
    return (
      <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
        <h3>No Assessment Result Available</h3>
        <p style={{ marginTop: 10, color: 'var(--text-muted)' }}>Please run a risk assessment first.</p>
        <button onClick={() => setView('assessment')} className="btn btn-primary" style={{ marginTop: 20 }}>
          Go to Assessment Form
        </button>
      </div>
    );
  }

  const { result, input_parameters, assessment_id, evaluation_timestamp } = resultData;
  const l1 = result.layer1;
  const l2 = result.layer2;
  const score = result.final_risk_score;
  const riskClass = result.final_risk_class;

  const getScoreBadge = (cls) => {
    switch (cls) {
      case 'CRITICAL':
        return <span className="badge badge-crit" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>CRITICAL HAZARD TIER</span>;
      case 'HIGH':
        return <span className="badge badge-high" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>HIGH RISK TIER</span>;
      case 'MODERATE':
        return <span className="badge badge-mod" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>MODERATE VULNERABILITY</span>;
      default:
        return <span className="badge badge-low" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>LOW PROBABILITY</span>;
    }
  };

  const getScoreColor = (cls) => {
    switch (cls) {
      case 'CRITICAL': return 'var(--risk-crit)';
      case 'HIGH': return 'var(--risk-high)';
      case 'MODERATE': return 'var(--risk-mod)';
      default: return 'var(--risk-low)';
    }
  };

  // Radar Chart Data: Factor Normalized Values
  const radarData = {
    labels: ['Rainfall (30%)', 'Slope (20%)', 'Soil Moist (20%)', 'Geology (15%)', 'NDVI (10%)', 'Land Cover (5%)'],
    datasets: [
      {
        label: 'Normalized Factor Value (0-1)',
        data: [
          l1.factors.rainfall.normalized,
          l1.factors.slope.normalized,
          l1.factors.soil_moisture.normalized,
          l1.factors.geology.normalized,
          l1.factors.ndvi.normalized,
          l1.factors.land_cover.normalized,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.25)',
        borderColor: '#EF4444',
        borderWidth: 2,
        pointBackgroundColor: '#EF4444',
      }
    ]
  };

  // Bar Chart Data: Points Contribution
  const barData = {
    labels: ['Rainfall', 'Slope', 'Soil Moist', 'Geology', 'NDVI', 'Land Cover'],
    datasets: [
      {
        label: 'Weighted Points Contribution',
        data: [
          l1.factors.rainfall.contribution,
          l1.factors.slope.contribution,
          l1.factors.soil_moisture.contribution,
          l1.factors.geology.contribution,
          l1.factors.ndvi.contribution,
          l1.factors.land_cover.contribution,
        ],
        backgroundColor: [
          '#0EA5E9', '#F59E0B', '#10B981', '#A855F7', '#22C55E', '#F97316'
        ],
        borderRadius: 6
      }
    ]
  };

  const downloadReport = () => {
    const reportText = `=====================================================
TERRAGUARD AI — LANDSLIDE RISK ASSESSMENT REPORT
=====================================================
Assessment ID: ${assessment_id}
Timestamp: ${evaluation_timestamp}
Location: ${input_parameters.location_name} (${input_parameters.latitude}°N, ${input_parameters.longitude}°E)

LAYER 1 DETERMINISTIC SCORE: ${l1.final_score} / 100
RISK CLASSIFICATION: ${l1.risk_class}
DOMINANT HAZARD DRIVER: ${l1.dominant_factor}
WINDOW MULTIPLIER: ${l1.multiplier}x (${input_parameters.window_hours} Hours)

LAYER 2 MACHINE LEARNING INFERENCE:
Model Architecture: ${l2.model_type || 'RandomForestClassifier'}
Landslide Probability: ${l2.probability_pct}%
ML Class: ${l2.risk_class}

INPUT PARAMETERS:
- Rainfall Accumulation: ${input_parameters.rainfall_mm} mm
- Slope Inclination: ${input_parameters.slope_deg} degrees
- Soil Saturation: ${input_parameters.soil_moisture_pct} %
- Bedrock Geology: ${input_parameters.geology_condition}
- NDVI (Vegetation Index): ${input_parameters.ndvi}
- Land Cover: ${input_parameters.land_cover}

RECOMMENDED MITIGATION ADVISORIES:
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

DISCLAIMER:
TerraGuard AI is a deterministic decision-support research platform based on historical archives. It does not replace official meteorological and civil defense alerts.
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraGuard_Report_${input_parameters.location_name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Banner Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={onBackToAssessment} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Adjust Parameters
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setView('map')} className="btn btn-secondary btn-sm">
            <MapPin size={16} /> View On Risk Map
          </button>
          <button onClick={downloadReport} className="btn btn-primary btn-sm">
            <Download size={16} /> Export Official Report
          </button>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-panel" style={{ padding: '32px 36px', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'center' }}>
          {/* Circular Score Display */}
          <div style={{ textAlign: 'center', background: 'rgba(15, 23, 42, 0.85)', padding: 24, borderRadius: 16, border: `2px solid ${getScoreColor(riskClass)}` }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Calculated Risk Index
            </div>
            <div style={{ fontSize: '4.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: getScoreColor(riskClass), lineHeight: 1, margin: '8px 0' }}>
              {score}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>out of 100</div>
          </div>

          {/* Details & Badges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              {getScoreBadge(riskClass)}
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Assessment #{assessment_id}
              </span>
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 6 }}>{input_parameters.location_name}</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
              Coordinates: {input_parameters.latitude}°N, {input_parameters.longitude}°E · Window: {input_parameters.window_hours}h Accumulation ({l1.multiplier}x multiplier)
            </p>

            <div style={{ display: 'flex', gap: 20, fontSize: '0.84rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Dominant Hazard Driver:</span>{' '}
                <strong style={{ color: 'var(--emerald-400)' }}>{l1.dominant_factor}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Evaluated At:</span>{' '}
                <span style={{ fontFamily: 'var(--font-mono)' }}>{new Date(evaluation_timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 1 vs Layer 2 Comparison */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Layer 1: Deterministic Weighted Model</h3>
            </div>
            <span className="badge badge-info">Rule-Based Safety Net</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Deterministic linear normalization across 6 geotechnical factors with explicit mathematical weights.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(15, 23, 42, 0.6)', padding: 14, borderRadius: 8 }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Computed Score</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: getScoreColor(l1.risk_class) }}>{l1.final_score} / 100</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Class / Threshold</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 4 }}>{l1.risk_class}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={18} color="var(--sky-400)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Layer 2: Empirical Random Forest ML</h3>
            </div>
            <span className="badge badge-info">Trained Model (120 Trees)</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Classification probability evaluated against 150 historical and non-landslide calibration records.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(15, 23, 42, 0.6)', padding: 14, borderRadius: 8 }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Landslide Probability</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--sky-400)' }}>
                {l2.available ? `${l2.probability_pct}%` : 'Standby'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Validation Test Accuracy</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 4, color: 'var(--emerald-400)' }}>
                {l2.metrics ? `${(l2.metrics.accuracy * 100).toFixed(1)}%` : 'Active'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Factor Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="glass-panel" style={{ padding: '22px 24px', height: 350 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 10 }}>Normalized Hazard Envelope (Radar Profile)</h3>
          <div style={{ height: 270 }}>
            <Radar 
              data={radarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    pointLabels: { color: '#94A3B8', font: { size: 11 } },
                    suggestedMin: 0,
                    suggestedMax: 1,
                    ticks: { display: false }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px 24px', height: 350 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 10 }}>Weighted Points Contribution (Layer 1)</h3>
          <div style={{ height: 270 }}>
            <Bar 
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748B' } },
                  y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748B' }, suggestedMax: 35 }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Explainability Breakdown & Recommendations */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Factor Breakdown Table */}
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Geotechnical Factor Breakdown</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Raw Value</th>
                  <th>Normalized</th>
                  <th>Contribution</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(l1.factors).map((key) => {
                  const f = l1.factors[key];
                  return (
                    <tr key={key}>
                      <td style={{ fontWeight: 600 }}>{f.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{f.raw_value}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', color: f.normalized > 0.6 ? 'var(--risk-crit)' : 'var(--text-secondary)' }}>
                          {(f.normalized * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald-400)' }}>
                        +{f.contribution} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Actionable Early Warning Advisories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.recommendations.map((rec, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, background: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <AlertOctagon size={18} color={getScoreColor(riskClass)} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {rec}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 12, background: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.74rem', color: '#FCA5A5' }}>
            <strong>Operational Note:</strong> Evacuation alerts must coordinate with local District Disaster Management Authorities (DDMA) and National Emergency Response Guidelines.
          </div>
        </div>
      </div>
    </div>
  );
}
