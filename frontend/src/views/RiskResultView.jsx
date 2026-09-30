import React, { useState } from 'react';
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
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  ArrowLeft, 
  MapPin, 
  Cpu, 
  BookOpen, 
  RefreshCw, 
  Clock, 
  Radio, 
  Layers,
  HelpCircle,
  FileText,
  Sparkles,
  Globe
} from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function RiskResultView({ 
  resultData, 
  setView, 
  onRefreshAssessment,
  onInspectOnMap 
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [alertError, setAlertError] = useState(null);
  const [copied, setCopied] = useState(false);

  // B1: Clear Error State on API failure
  if (resultData?.error) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 640, margin: '40px auto', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', marginBottom: 18 }}>
          <AlertTriangle size={38} />
        </div>
        <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: 12 }}>
          Unable to load the risk assessment for this location right now. Please try again.
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, marginBottom: 26 }}>
          The telemetry service or historical archive could not be reached for these coordinates. You can retry the assessment or choose another location on the map.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          {onRefreshAssessment && (
            <button 
              onClick={() => onRefreshAssessment(resultData.location?.latitude || 11.554, resultData.location?.longitude || 76.042, resultData.location?.name || "Target Area", true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <RefreshCw size={16} /> Retry Assessment
            </button>
          )}
          <button onClick={() => setView('home')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Choose Another Location
          </button>
        </div>
      </div>
    );
  }

  // B1: Clear Empty State when no resultData is loaded
  if (!resultData || Object.keys(resultData).length === 0) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
        <div style={{ display: 'inline-flex', padding: 14, borderRadius: '50%', background: 'rgba(14, 165, 233, 0.15)', color: 'var(--sky-400)', marginBottom: 16 }}>
          <MapPin size={32} />
        </div>
        <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: 8 }}>No Assessment Result Available</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
          Please select a location on the interactive map or search for a district to evaluate landslide susceptibility.
        </p>
        <button onClick={() => setView('home')} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={16} /> Go to Location Selection
        </button>
      </div>
    );
  }

  // Handle location-first payload format vs legacy format
  const isLocationFirst = !!resultData.location;

  const loc = isLocationFirst ? resultData.location : {
    name: resultData.input_parameters?.location_name || "Custom Coordinates",
    latitude: resultData.input_parameters?.latitude || 11.554,
    longitude: resultData.input_parameters?.longitude || 76.042,
    region: "Evaluated Geographic Area"
  };

  const score = isLocationFirst ? resultData.risk_score : (resultData.result?.final_risk_score || 0);
  const riskClass = isLocationFirst ? resultData.risk_level : (resultData.result?.final_risk_class || "LOW");
  const assessmentMode = isLocationFirst ? resultData.assessment_mode : "historical_plus_current";
  const modeDescription = resultData.mode_description || (
    assessmentMode === "historical_plus_current"
      ? "Historical Landslide Evidence + Current Environmental Conditions + Geographic Factors"
      : "No historical landslide records were available for this location. The assessment below is based on currently available environmental and geographic indicators."
  );

  const dominantFactor = isLocationFirst ? resultData.dominant_factor : (resultData.result?.dominant_factor || "Rainfall Volume");
  const explanation = resultData.explanation || "The assessment synthesizes available atmospheric, terrain, and historical indicators.";
  const explanationSource = resultData.explanation_source || "rule_based_fallback";
  const timestamp = resultData.timestamp || resultData.evaluation_timestamp || new Date().toISOString();
  const dataCoverage = resultData.data_coverage || { available_factors: 6, total_factors: 7, coverage_note: "6 of 7 factors evaluated" };
  const history = resultData.historical_evidence || { records_available: false, events_found: 0, search_radius_km: 25 };
  const conditions = resultData.current_conditions || {};
  const rawFactors = resultData.factors || resultData.result?.layer1?.factors || {};

  const handleRefreshClick = async () => {
    if (onRefreshAssessment) {
      setRefreshing(true);
      await onRefreshAssessment(loc.latitude, loc.longitude, loc.name, true);
      setRefreshing(false);
    }
  };

  const handleGenerateAlert = async () => {
    setAlertLoading(true);
    setAlertError(null);
    try {
      const res = await fetch(`/api/location/alert-dispatch?lat=${loc.latitude}&lon=${loc.longitude}&language=${selectedLanguage}`);
      const data = await res.json();
      if (!res.ok) {
        setAlertError(data.detail?.message || data.detail?.error || data.error || 'Failed to generate alert message with Gemini.');
        setAlertData(null);
      } else {
        setAlertData(data);
        setAlertError(null);
      }
    } catch (err) {
      setAlertError('Network error connecting to TerraGuard backend server: ' + err.message);
      setAlertData(null);
    } finally {
      setAlertLoading(false);
    }
  };

  const handleCopyAlert = () => {
    if (alertData?.alert_message) {
      navigator.clipboard.writeText(alertData.alert_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  const getScoreBadge = (cls) => {
    switch (cls) {
      case 'CRITICAL':
        return <span className="badge badge-crit" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>CRITICAL SUSCEPTIBILITY</span>;
      case 'HIGH':
        return <span className="badge badge-high" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>HIGH SUSCEPTIBILITY</span>;
      case 'MODERATE':
        return <span className="badge badge-mod" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>MODERATE VULNERABILITY</span>;
      default:
        return <span className="badge badge-low" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>LOW SUSCEPTIBILITY</span>;
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

  // Prepare factor array for table with honest "Data unavailable" fallback
  const factorRows = Object.entries(rawFactors).map(([key, f]) => ({
    key,
    name: f.name || key,
    rawValue: f.raw_value || (f.value !== undefined ? String(f.value) : "Data unavailable"),
    status: f.status || "Available",
    normalized: f.normalized !== undefined ? f.normalized : null,
    weightPct: f.normalized_weight_pct || f.weight_pct || 0,
    contribution: f.contribution || 0,
    hazardLevel: f.hazardLevel || f.hazard_level || (f.normalized ? (f.normalized > 0.65 ? 'High' : (f.normalized > 0.35 ? 'Moderate' : 'Low')) : 'Excluded')
  }));

  // Radar Chart Data with defensive empty handling
  const validRadarFactors = factorRows.filter(f => f.normalized !== null);
  const radarData = {
    labels: validRadarFactors.length > 0 
      ? validRadarFactors.map(f => `${f.name} (${f.weightPct}%)`)
      : ['No Active Factors'],
    datasets: [
      {
        label: 'Normalized Factor Value (0-1)',
        data: validRadarFactors.length > 0 ? validRadarFactors.map(f => f.normalized) : [0],
        backgroundColor: assessmentMode === 'historical_plus_current' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(14, 165, 233, 0.25)',
        borderColor: assessmentMode === 'historical_plus_current' ? '#EF4444' : '#0EA5E9',
        borderWidth: 2,
        pointBackgroundColor: assessmentMode === 'historical_plus_current' ? '#EF4444' : '#0EA5E9',
      }
    ]
  };

  // Download Report
  const handleDownloadReport = () => {
    const reportText = `=====================================================
TERRAGUARD AI — LOCATION-AWARE LANDSLIDE RISK REPORT
=====================================================
Target Location: ${loc.name}
Region: ${loc.region || 'Coordinates Area'}
Coordinates: ${loc.latitude}°N, ${loc.longitude}°E
Analysis Timestamp: ${timestamp}
Assessment Mode: ${assessmentMode === 'historical_plus_current' ? 'MODE A: Historical Evidence + Current Conditions' : 'MODE B: Current Conditions Only'}

-----------------------------------------------------
RISK ASSESSMENT SUMMARY:
-----------------------------------------------------
Risk Score: ${score} / 100
Risk Level: ${riskClass}
Dominant Hazard Driver: ${dominantFactor}
Data Coverage: ${dataCoverage.coverage_note || `${dataCoverage.available_factors} of ${dataCoverage.total_factors} factors`}

-----------------------------------------------------
HISTORICAL LANDSLIDE EVIDENCE:
-----------------------------------------------------
Records Found: ${history.records_available ? `Yes (${history.events_found} events within ${history.search_radius_km} km)` : `No relevant historical records within ${history.search_radius_km} km`}
Nearest Historical Event: ${history.nearest_event_distance_km ? `${history.nearest_event_distance_km} km` : 'N/A'}
Most Recent Event: ${history.most_recent_event || 'None on record in dataset'}

-----------------------------------------------------
CURRENT CONDITIONS:
-----------------------------------------------------
Current Rainfall: ${conditions.rainfall_mm ?? 'N/A'} mm
24h Forecast Rainfall: ${conditions.forecast_24h_sum_mm ?? 'N/A'} mm
Terrain Slope: ${conditions.slope_deg ?? 'N/A'} degrees
Soil Moisture Saturation: ${conditions.soil_moisture_pct ?? 'N/A'} %
Temperature: ${conditions.temperature_c ?? 'N/A'} °C
Weather Condition: ${conditions.weather_condition ?? 'N/A'}

-----------------------------------------------------
CONTRIBUTING FACTORS TABLE:
-----------------------------------------------------
${factorRows.map(f => `- ${f.name}: Value=${f.rawValue} | Status=${f.status} | Weight=${f.weightPct}% | Contribution=${f.contribution} pts`).join('\n')}

-----------------------------------------------------
EXPLAINABLE RATIONALE:
-----------------------------------------------------
${explanation}

-----------------------------------------------------
SAFETY DISCLAIMER:
-----------------------------------------------------
${resultData.safety_disclaimer || "TerraGuard AI is a prototype data-analysis platform. Results are not an official disaster warning. Follow instructions from authorized disaster-management authorities."}
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraGuard_Report_${loc.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Top Navigation & Action Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <button onClick={() => setView('home')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Choose Another Location
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={handleRefreshClick} 
            disabled={refreshing}
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "🔄 Refresh Current Assessment"}
          </button>

          {onInspectOnMap && (
            <button 
              onClick={() => onInspectOnMap(loc.latitude, loc.longitude)}
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <MapPin size={15} /> 🗺 View on Map
            </button>
          )}

          <button onClick={handleDownloadReport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={15} /> Export Audit Report
          </button>
        </div>
      </div>

      {/* Mode Badge & Scope Notification Banner */}
      <div style={{ 
        padding: '12px 18px', 
        borderRadius: 8, 
        marginBottom: 20, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 14,
        background: assessmentMode === 'historical_plus_current' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(14, 165, 233, 0.12)',
        border: `1px solid ${assessmentMode === 'historical_plus_current' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(14, 165, 233, 0.35)'}`
      }}>
        <Radio size={20} color={assessmentMode === 'historical_plus_current' ? 'var(--emerald-400)' : 'var(--sky-400)'} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: assessmentMode === 'historical_plus_current' ? 'var(--emerald-400)' : 'var(--sky-400)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {assessmentMode === 'historical_plus_current' ? 'MODE A — HISTORICAL + CURRENT ASSESSMENT' : 'MODE B — CURRENT-CONDITION ASSESSMENT'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {modeDescription}
          </div>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-panel" style={{ padding: '28px 30px', marginBottom: 24, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <MapPin size={18} color="var(--emerald-400)" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Evaluated Target Location</span>
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: 4, color: 'white' }}>
            {loc.name}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            {loc.region || 'Coordinates Area'} · <span style={{ fontFamily: 'var(--font-mono)' }}>{loc.latitude}°N, {loc.longitude}°E</span>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            {getScoreBadge(riskClass)}
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Dominant Trigger: <strong style={{ color: 'var(--text-primary)' }}>{dominantFactor}</strong>
            </span>
          </div>

          {/* Cautious Language Banner (Section 18) */}
          <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <HelpCircle size={15} color="var(--cyan-400)" style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {riskClass === 'LOW' 
              ? "Based on the currently available data, TerraGuard AI does not identify strong indicators of elevated landslide risk at this time. However, this assessment is not 100% certain and conditions can change."
              : (riskClass === 'MODERATE'
                ? "Several available indicators suggest moderate landslide susceptibility. Regular slope inspection is advised."
                : "Several available indicators suggest elevated landslide susceptibility at the time of assessment. This is a data-based prototype assessment, not an official disaster warning."
              )
            }
          </div>
        </div>

        {/* Score Dial / Number */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--border-subtle)', paddingLeft: 20 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Prototype Risk Score
          </span>
          <div style={{ fontSize: '4.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: getScoreColor(riskClass), lineHeight: 1 }}>
            {score}
          </div>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: 4 }}>
            out of 100
          </span>
          {/* Missing-Factor Proportional Renormalization Badge */}
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 14, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--emerald-400)', fontSize: '0.78rem', fontWeight: 600 }}>
            <Layers size={13} /> {dataCoverage.coverage_note || `Score based on ${dataCoverage.available_factors} of ${dataCoverage.total_factors} factors`}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
            (Calculated score, not a probability percentage)
          </span>
        </div>
      </div>

      {/* Grid: Historical Evidence Card + Current Conditions Update Card */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        
        {/* Section 8 & 9: Historical Evidence Card */}
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <BookOpen size={18} color={history.records_available ? "var(--emerald-400)" : "var(--amber-400)"} />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>📚 Historical Landslide Evidence</h3>
          </div>

          {history.records_available ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical Events Found</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>
                    {history.events_found}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nearest Historical Event</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--sky-400)', fontFamily: 'var(--font-mono)' }}>
                    {history.nearest_event_distance_km} km
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Most Recent Event</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {history.most_recent_event || 'On Record'}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Search Radius</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {history.search_radius_km} km
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Documented historical landslides indicate verified past slope instability under extreme precipitation triggers in this geographic radius.
              </p>
            </div>
          ) : (
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FCD34D', fontWeight: 700, fontSize: '0.92rem', marginBottom: 6 }}>
                ⚠️ No Historical Records Found
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.45 }}>
                «No relevant historical landslide records were found for this location in the available dataset.»
              </p>
              <p style={{ fontSize: '0.8rem', color: '#FCD34D', margin: 0, lineHeight: 1.45 }}>
                «This does not mean that the location has zero landslide risk. It only means that no relevant historical records were available in the dataset used by TerraGuard AI.»
              </p>
            </div>
          )}
        </div>

        {/* Section 12: Current Location Update Card */}
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--sky-400)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>📡 Current Location Update</h3>
            </div>
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', background: 'rgba(14, 165, 233, 0.15)', color: 'var(--sky-400)', padding: '2px 8px', borderRadius: 4 }}>
              LIVE TELEMETRY
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Location:</span>
              <strong>{loc.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Analysis Time:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{new Date(timestamp).toLocaleTimeString()} ({new Date(timestamp).toLocaleDateString()})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Weather:</span>
              <span style={{ color: conditions.weather_status === 'Available' ? 'var(--emerald-400)' : 'var(--amber-400)', fontWeight: 600 }}>
                {conditions.weather_condition || 'Data unavailable'} ({conditions.weather_status || 'Unavailable'})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Recent Rainfall / 24h Forecast:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                {conditions.rainfall_mm !== null && conditions.rainfall_mm !== undefined ? `${conditions.rainfall_mm} mm` : 'Data unavailable'} / {conditions.forecast_24h_sum_mm !== null && conditions.forecast_24h_sum_mm !== undefined ? `${conditions.forecast_24h_sum_mm} mm` : 'Data unavailable'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Terrain DEM & Slope:</span>
              <span style={{ color: 'var(--sky-400)' }}>
                {conditions.slope_deg !== null && conditions.slope_deg !== undefined ? `${conditions.slope_deg}° Slope (${conditions.elevation_m ? `${conditions.elevation_m}m elevation` : 'Open-Meteo DEM'})` : 'Data unavailable'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Soil Moisture:</span>
              <span>{conditions.soil_moisture_pct !== null && conditions.soil_moisture_pct !== undefined ? `${conditions.soil_moisture_pct}% (Hydrological Model)` : 'Data unavailable'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Historical Records:</span>
              <span style={{ color: history.records_available ? 'var(--emerald-400)' : '#FCD34D' }}>
                {history.records_available ? `Found (${history.events_found} events within 25km)` : 'None (No records found)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Data Coverage:</span>
              <strong style={{ color: 'var(--emerald-400)' }}>{dataCoverage.coverage_note || `${dataCoverage.available_factors}/${dataCoverage.total_factors} available`}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Section 20: Explainable Result Section */}
      <div className="glass-panel" style={{ padding: '24px 26px', marginBottom: 24, border: '1px solid rgba(14, 165, 233, 0.35)', background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.06) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={20} color="var(--sky-400)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Why did TerraGuard give this assessment?</h3>
          </div>
          {explanationSource === 'gemini' ? (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 5, 
              background: 'rgba(59, 130, 246, 0.18)', 
              color: '#60A5FA', 
              border: '1px solid rgba(59, 130, 246, 0.45)', 
              borderRadius: 6, 
              padding: '3px 10px', 
              fontSize: '0.74rem', 
              fontWeight: 600,
              letterSpacing: '0.02em'
            }}>
              <Sparkles size={13} color="#60A5FA" /> Explanation generated by Gemini
            </span>
          ) : (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 5, 
              background: 'rgba(255, 255, 255, 0.06)', 
              color: 'var(--text-muted)', 
              border: '1px solid rgba(255, 255, 255, 0.12)', 
              borderRadius: 6, 
              padding: '3px 10px', 
              fontSize: '0.74rem' 
            }}>
              Rule-based explanation (Gemini unavailable)
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.94rem', color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>
          {explanation}
        </p>
      </div>

      {/* FEATURE B: Gemini-Generated Multilingual Alert Dispatch Card */}
      <div className="glass-panel" style={{ padding: '24px 26px', marginBottom: 24, border: '1px solid rgba(99, 102, 241, 0.35)', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Radio size={20} color="#818CF8" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>📢 Multilingual Civil Alert Dispatch</h3>
          </div>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 5, 
            background: 'rgba(99, 102, 241, 0.18)', 
            color: '#A5B4FC', 
            border: '1px solid rgba(99, 102, 241, 0.4)', 
            borderRadius: 6, 
            padding: '3px 10px', 
            fontSize: '0.74rem', 
            fontWeight: 600 
          }}>
            <Sparkles size={13} color="#A5B4FC" /> Powered by Google Gemini API
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
          Generate a factual, civil-broadcast alert message tailored for community SMS, radio bulletin, or Panchayat disaster coordination in regional languages, grounded strictly in this location's calculated risk profile.
        </p>

        {/* Controls: Language Selector + Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={16} color="var(--text-muted)" />
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Target Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={alertLoading}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                padding: '7px 12px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="ml">Malayalam (മലയാളം)</option>
              <option value="bn">Bengali (বাংলা)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="mr">Marathi (मराठी)</option>
            </select>
          </div>

          <button
            onClick={handleGenerateAlert}
            disabled={alertLoading}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
              border: 'none',
              borderRadius: 6,
              color: '#FFFFFF',
              cursor: alertLoading ? 'not-allowed' : 'pointer',
              opacity: alertLoading ? 0.7 : 1
            }}
          >
            {alertLoading ? (
              <>
                <RefreshCw size={15} className="spin-animate" />
                <span>Generating with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate Alert Message</span>
              </>
            )}
          </button>
        </div>

        {/* Loading State */}
        {alertLoading && (
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 8, padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#A5B4FC', fontSize: '0.88rem' }}>
              <RefreshCw size={16} className="spin-animate" />
              <span>Contacting Google Gemini API for real-time translation & civil alert synthesis...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {alertError && !alertLoading && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#FCA5A5', fontSize: '0.88rem', display: 'block', marginBottom: 4 }}>
                  Alert generation is temporarily unavailable
                </strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.45 }}>
                  {alertError}
                </p>
                <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Note: Pre-computed alert templates are omitted to ensure translation integrity. Provide <code>GEMINI_API_KEY</code> in environment to activate live multilingual generation.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {alertData && !alertLoading && (
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(99, 102, 241, 0.45)', borderRadius: 8, padding: '18px 20px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#C7D2FE', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {alertData.language_name || alertData.language.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#60A5FA', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={12} /> Generated by Gemini
                </span>
              </div>
              <button
                onClick={handleCopyAlert}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)' }}
              >
                {copied ? <CheckCircle size={13} color="var(--emerald-400)" /> : <Download size={13} />}
                <span>{copied ? 'Copied!' : 'Copy Dispatch'}</span>
              </button>
            </div>

            <div style={{ fontSize: '0.98rem', color: '#F8FAFC', lineHeight: 1.6, padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 12, fontFamily: selectedLanguage === 'en' ? 'inherit' : 'sans-serif' }}>
              {alertData.alert_message}
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              <strong>Broadcast Protocol:</strong> Suitable for community SMS blast, automated radio bulletin, or Panchayat disaster coordination. {alertData.safety_disclaimer}
            </div>
          </div>
        )}
      </div>


      {/* Section 19: Contributing Factors Table */}
      <div className="glass-panel" style={{ padding: '24px 26px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="var(--emerald-400)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>📊 Contributing Factors & Dynamic Normalization</h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Missing factors excluded & available weights normalized to 100%
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Factor</th>
                <th style={{ padding: '10px 12px' }}>Value</th>
                <th style={{ padding: '10px 12px' }}>Data Status</th>
                <th style={{ padding: '10px 12px' }}>Normalized Weight</th>
                <th style={{ padding: '10px 12px' }}>Contribution</th>
                <th style={{ padding: '10px 12px' }}>Risk Influence</th>
              </tr>
            </thead>
            <tbody>
              {factorRows.map((f, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: f.normalized === null ? 'rgba(0,0,0,0.15)' : 'transparent' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{f.name}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: f.normalized === null ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {f.rawValue}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: 4, 
                      fontSize: '0.72rem', 
                      background: f.status.includes('Current') ? 'rgba(16, 185, 129, 0.15)' : (f.status.includes('Historical') ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255,255,255,0.06)'),
                      color: f.status.includes('Current') ? 'var(--emerald-400)' : (f.status.includes('Historical') ? 'var(--sky-400)' : 'var(--text-secondary)')
                    }}>
                      {f.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>
                    {f.weightPct > 0 ? `${f.weightPct}%` : '0% (Excluded)'}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: f.contribution > 15 ? 'var(--risk-high)' : 'var(--text-secondary)' }}>
                    {f.contribution > 0 ? `+${f.contribution} pts` : '0 pts'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ 
                      fontSize: '0.75rem',
                      color: f.hazardLevel === 'High' ? 'var(--risk-crit)' : (f.hazardLevel === 'Moderate' ? 'var(--risk-mod)' : (f.hazardLevel === 'Low' ? 'var(--risk-low)' : 'var(--text-muted)'))
                    }}>
                      {f.hazardLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Radar Profile Visualization */}
      <div className="glass-panel" style={{ padding: '24px 26px', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>Radar Geotechnical Profile</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 18 }}>
          Multi-dimensional visualization of normalized active factors for this location:
        </p>
        <div style={{ height: 280, maxWidth: 500, margin: '0 auto' }}>
          <Radar 
            data={radarData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  min: 0,
                  max: 1.0,
                  ticks: { stepSize: 0.2, backdropColor: 'transparent', color: 'rgba(255,255,255,0.4)', font: { size: 9 } },
                  grid: { color: 'rgba(255,255,255,0.1)' },
                  angleLines: { color: 'rgba(255,255,255,0.1)' },
                  pointLabels: { color: 'rgba(255,255,255,0.8)', font: { size: 11, weight: 'bold' } }
                }
              },
              plugins: { legend: { display: false } }
            }}
          />
        </div>
      </div>

      {/* Section 30: Prominent Safety Disclaimer */}
      <div style={{ padding: '16px 20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Shield size={22} color="var(--risk-crit)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: '#FCA5A5', display: 'block', marginBottom: 4 }}>Official Safety Notice:</strong>
          {resultData.safety_disclaimer || "TerraGuard AI is a prototype data-analysis and risk-assessment platform. Its results are not an official disaster warning or emergency notification. TerraGuard AI cannot guarantee whether a landslide will or will not occur. In an actual emergency or when official warnings are issued, follow instructions from authorized disaster-management and local authorities."}
        </div>
      </div>

    </div>
  );
}
