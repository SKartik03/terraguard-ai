/**
 * TerraGuard AI - Risk Result View (Vanilla JS)
 * Displays the comprehensive multi-layer risk assessment,
 * dynamic geotechnical factor contributions, Gemini explainable narrative,
 * and Gemini multilingual alert dispatch synthesis.
 */
import api from '../api.js';

export const RiskResultView = {
  render(container, state, router) {
    const data = state.resultData;

    // Empty state guard (no blank screens!)
    if (!data) {
      container.innerHTML = `
        <div class="glass-panel animate-fade-in" style="padding: 40px; text-align: center; max-width: 600px; margin: 40px auto;">
          <div style="font-size: 3rem; margin-bottom: 12px;">📊</div>
          <h2 style="font-size: 1.4rem; color: #FFFFFF; margin-bottom: 8px;">No Assessment Available</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px;">
            Select a target location on the Home page or specify environmental inputs to run a multi-layer evaluation.
          </p>
          <button id="no-result-home-btn" class="btn btn-primary">
            📍 Select a Location
          </button>
        </div>
      `;
      const btn = document.getElementById('no-result-home-btn');
      if (btn) btn.onclick = () => router.navigate('home');
      return;
    }

    const loc = data.location || { name: "Selected Location", latitude: 11.5540, longitude: 76.0422, region: "India" };
    const score = data.risk_score != null ? data.risk_score : (data.result?.final_risk_score || 0.0);
    const riskLevel = data.risk_level || data.result?.final_risk_class || 'LOW';
    const mode = data.assessment_mode || 'current_condition_only';
    const isModeA = mode === 'historical_plus_current';
    const dominant = data.dominant_factor || data.result?.dominant_factor || 'Rainfall Volume';
    const explanation = data.explanation || "No explanation narrative recorded for this assessment.";
    const explanationSource = data.explanation_source || "rule_based_fallback";
    const factors = data.factors || data.result?.layer1?.factors || {};
    const timestamp = data.timestamp || data.evaluation_timestamp || new Date().toISOString();

    const getBadgeClass = (lvl) => {
      switch (lvl) {
        case 'CRITICAL': return 'badge-crit';
        case 'HIGH': return 'badge-high';
        case 'MODERATE': return 'badge-mod';
        default: return 'badge-low';
      }
    };

    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Header Bar -->
        <div class="glass-panel" style="padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="badge ${getBadgeClass(riskLevel)}" style="font-size: 0.85rem; padding: 4px 12px;">
                ${riskLevel} RISK
              </span>
              <span style="font-size: 0.75rem; color: ${isModeA ? 'var(--emerald-400)' : 'var(--sky-400)'}; background: rgba(15,23,42,0.6); padding: 4px 10px; border-radius: 9999px; border: 1px solid var(--border-subtle);">
                ${isModeA ? '📚 Mode A: Historical Records + Live Telemetry' : '🔬 Mode B: Current-Condition Normalization'}
              </span>
            </div>
            <h1 style="font-size: 1.8rem; margin: 4px 0 2px 0; color: #FFFFFF;">${loc.name}</h1>
            <span style="font-size: 0.82rem; color: var(--text-muted);">
              ${loc.latitude?.toFixed(4)}° N, ${loc.longitude?.toFixed(4)}° E · ${loc.region || 'Assessed Area'} · Evaluated at: ${new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="result-refresh-btn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
              🔄 Re-evaluate
            </button>
            <button id="result-map-btn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
              🗺️ Inspect on Map
            </button>
            <button id="result-route-btn" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 6px;">
              🧭 Plan Safe Route
            </button>
          </div>
        </div>

        <!-- Score & Dominant Factor Overview -->
        <div class="grid-3">
          <!-- Final Score Card -->
          <div class="glass-panel" style="padding: 24px; text-align: center; border-top: 3px solid ${riskLevel === 'CRITICAL' ? 'var(--risk-crit)' : (riskLevel === 'HIGH' ? 'var(--risk-high)' : 'var(--risk-low)')};">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">COMPOSITE HAZARD SCORE</span>
            <div style="font-size: 3.5rem; font-weight: 800; color: #FFFFFF; line-height: 1.1; margin: 8px 0;">
              ${score}<span style="font-size: 1.4rem; color: var(--text-muted); font-weight: 400;">/100</span>
            </div>
            <span class="badge ${getBadgeClass(riskLevel)}">${riskLevel} SUSCEPTIBILITY</span>
          </div>

          <!-- Dominant Factor Card -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; justify-content: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">PRIMARY HAZARD DRIVER</span>
            <h3 style="font-size: 1.3rem; color: var(--sky-400); margin: 8px 0 4px 0;">
              ${dominant}
            </h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0; line-height: 1.4;">
              Exerts the highest proportional geotechnical strain on slope equilibrium under current conditions.
            </p>
          </div>

          <!-- Historical Incidents Summary Card -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; justify-content: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">HISTORICAL PROXIMITY EVIDENCE</span>
            <div style="font-size: 1.4rem; font-weight: 700; color: #FFFFFF; margin: 8px 0 4px 0;">
              ${isModeA ? `${data.historical_evidence?.events_found || 0} Incident(s) in Radius` : 'Zero Catalog Incidents'}
            </div>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0; line-height: 1.4;">
              ${isModeA ? `Nearest verified incident at ${data.historical_evidence?.nearest_event_distance_km || 'N/A'} km from location.` : 'Assessed purely via Mode B environmental indicators without fabricating risk.'}
            </p>
          </div>
        </div>

        <!-- Explainable Reasoning Narrative (FEATURE A: GEMINI EXPLANATION) -->
        <div class="glass-panel" style="padding: 24px; border-left: 4px solid #06B6D4;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <h3 style="margin: 0; font-size: 1.15rem; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
              <span>💡</span> Transparent Explainability Narrative
            </h3>
            <!-- Honest Source Label -->
            ${explanationSource === 'gemini' ? `
              <span class="badge-gemini">
                ✨ Explanation generated by Gemini
              </span>
            ` : `
              <span class="badge-fallback">
                📋 Rule-based explanation (Gemini unavailable)
              </span>
            `}
          </div>

          <p style="font-size: 0.95rem; line-height: 1.65; color: var(--text-primary); margin: 0 0 14px 0; background: rgba(15, 23, 42, 0.5); padding: 16px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            ${explanation}
          </p>

          <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            <span>ℹ️</span> 
            <em>Based strictly on computed geotechnical parameters. TerraGuard AI never mutates numerical scores through LLM generation.</em>
          </div>
        </div>

        <!-- Multilingual Alert Dispatch Synthesizer (FEATURE B: GEMINI ALERT DISPATCH) -->
        <div class="glass-panel" style="padding: 24px; border-left: 4px solid #10B981;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
                <span>📢</span> Civil Alert Dispatch Synthesizer (Gemini Multilingual)
              </h3>
              <span style="font-size: 0.78rem; color: var(--text-muted);">
                Generates community warning broadcasts in regional Indian languages directly from computed metrics.
              </span>
            </div>
            
            <!-- Language Selector Controls -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <select id="alert-lang-select" class="form-control" style="font-size: 0.85rem; padding: 6px 12px; width: auto; background: rgba(15, 23, 42, 0.8);">
                <option value="en">English (Official)</option>
                <option value="hi" selected>Hindi (हिंदी)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
              </select>
              <button id="btn-generate-alert" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 600;">
                <span>✨</span> Generate Alert Message
              </button>
            </div>
          </div>

          <!-- Alert Output Container -->
          <div id="alert-dispatch-output" style="margin-top: 14px;">
            <div style="padding: 16px; background: rgba(15, 23, 42, 0.5); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle); color: var(--text-muted); font-size: 0.85rem; text-align: center;">
              Select a regional language and click <strong>"Generate Alert Message"</strong> to synthesize a civil broadcast via Gemini API.
            </div>
          </div>
        </div>

        <!-- Geotechnical Contributing Factors Breakdown -->
        <div class="glass-panel" style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 1.15rem; color: #FFFFFF;">
            Geotechnical & Environmental Factor Contributions
          </h3>
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Factor Name</th>
                  <th>Observed Value</th>
                  <th>Status</th>
                  <th>Normalized Weight</th>
                  <th>Contribution</th>
                  <th>Hazard Level</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(factors).map(([key, f]) => {
                  const isExcluded = f.hazard_level === 'Excluded' || f.hazardLevel === 'Excluded' || f.normalized == null;
                  const weightPct = f.normalized_weight_pct != null ? `${f.normalized_weight_pct}%` : '--';
                  const contrib = f.contribution != null ? f.contribution : '--';
                  const hz = f.hazard_level || f.hazardLevel || (isExcluded ? 'Excluded' : 'Low');

                  return `
                    <tr style="${isExcluded ? 'opacity: 0.5;' : ''}">
                      <td><strong>${f.name || key}</strong></td>
                      <td>${f.raw_value || '--'}</td>
                      <td><span style="font-size: 0.75rem; color: var(--text-muted);">${f.status || 'Active'}</span></td>
                      <td><span style="color: var(--sky-400); font-weight: 600;">${weightPct}</span></td>
                      <td><strong>${contrib} pts</strong></td>
                      <td>
                        <span class="badge ${hz === 'High' ? 'badge-crit' : (hz === 'Moderate' ? 'badge-mod' : (hz === 'Low' ? 'badge-low' : ''))}" style="font-size: 0.7rem;">
                          ${hz}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mandatory Safety Disclaimer -->
        <div style="padding: 16px 20px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); font-size: 0.8rem; color: #FCA5A5; line-height: 1.5;">
          <strong>Official Safety Notice:</strong> ${data.safety_disclaimer || 'TerraGuard AI is a prototype analytical risk-assessment tool. Results do not constitute an official evacuation or disaster warning. Follow instructions from National Disaster Management Authority (NDMA) and local district authorities.'}
        </div>

      </div>
    `;

    // 1. Navigation Button Actions
    const refreshBtn = document.getElementById('result-refresh-btn');
    if (refreshBtn) {
      refreshBtn.onclick = () => {
        state.activeLocationTarget = loc;
        state.processingLocationName = loc.name;
        router.navigate('processing');
      };
    }

    const mapBtn = document.getElementById('result-map-btn');
    if (mapBtn) {
      mapBtn.onclick = () => {
        state.activeLocationTarget = loc;
        router.navigate('map');
      };
    }

    const routeBtn = document.getElementById('result-route-btn');
    if (routeBtn) {
      routeBtn.onclick = () => {
        state.activeLocationTarget = loc;
        router.navigate('route');
      };
    }

    // 2. Multilingual Alert Dispatch Handler (Feature B)
    const alertBtn = document.getElementById('btn-generate-alert');
    const langSelect = document.getElementById('alert-lang-select');
    const alertOutput = document.getElementById('alert-dispatch-output');

    if (alertBtn && langSelect && alertOutput) {
      alertBtn.onclick = async () => {
        const lang = langSelect.value;
        const lat = loc.latitude || 11.5540;
        const lon = loc.longitude || 76.0422;

        alertBtn.disabled = true;
        alertOutput.innerHTML = `
          <div style="padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: var(--radius-md); text-align: center; color: var(--sky-400); font-size: 0.85rem;">
            ⏳ Calling Google Gemini API for regional civil alert synthesis (${lang.toUpperCase()})...
          </div>
        `;

        try {
          const res = await api.getAlertDispatch(lat, lon, lang);
          alertBtn.disabled = false;

          alertOutput.innerHTML = `
            <div class="alert-dispatch-box animate-fade-in" style="border: 1px solid var(--emerald-500); background: rgba(16, 185, 129, 0.06);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: #FFFFFF; display: flex; align-items: center; gap: 6px;">
                  <span>🚨</span> Civil Alert Broadcast (${res.language_name || lang.toUpperCase()})
                </span>
                <span class="badge-gemini">
                  ✨ Generated by Gemini
                </span>
              </div>
              <div style="font-size: 1rem; line-height: 1.6; color: #FFFFFF; margin: 10px 0; font-family: var(--font-heading); font-weight: 500; background: rgba(15, 23, 42, 0.7); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                ${res.alert_message}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted); margin-top: 6px;">
                <span>Disaster Management Cell Format (SMS / Loudspeaker Broadcast)</span>
                <span>Factual · Non-alarmist public safety advisory</span>
              </div>
            </div>
          `;
        } catch (err) {
          alertBtn.disabled = false;
          let msg = err.message || "Alert generation is temporarily unavailable";
          alertOutput.innerHTML = `
            <div style="padding: 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); color: #FCA5A5; font-size: 0.85rem;">
              <strong style="color: #EF4444;">⚠️ Alert generation is temporarily unavailable</strong><br>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${msg}</span><br>
              <div style="margin-top: 8px; font-size: 0.75rem; color: #CBD5E1;">
                <em>Note: As per safety policy, hardcoded templates are not substituted to prevent inaccurate translations. Configure <code>GEMINI_API_KEY</code> in environment to activate live multilingual synthesis.</em>
              </div>
            </div>
          `;
        }
      };
    }
  }
};

export default RiskResultView;
