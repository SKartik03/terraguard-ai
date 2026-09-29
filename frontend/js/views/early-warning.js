/**
 * TerraGuard AI - Early Warning Protocols View (Vanilla JS)
 * Multi-tier hazard alert thresholds, standard operating procedures,
 * and rainfall trigger matrices.
 */
export const EarlyWarningView = {
  render(container) {
    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Header -->
        <div class="glass-panel" style="padding: 24px;">
          <h1 style="font-size: 1.8rem; margin: 0 0 6px 0; color: #FFFFFF;">Multi-Tier Early Warning Standard Operating Protocols</h1>
          <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0; line-height: 1.5;">
            Aligns with National Disaster Management Authority (NDMA) guidelines and Geological Survey of India early warning thresholds.
          </p>
        </div>

        <!-- 3 Alert Tier Cards -->
        <div class="grid-3">
          <!-- Advisory Tier -->
          <div class="glass-panel" style="padding: 24px; border-top: 4px solid var(--risk-mod);">
            <span class="badge badge-mod" style="margin-bottom: 8px;">TIER 1 · ADVISORY</span>
            <h3 style="margin: 0 0 6px 0; font-size: 1.2rem; color: #FFFFFF;">Moderate Susceptibility</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Composite Risk Score: 40.0 – 69.9</span>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin: 12px 0;">
              Moderate environmental saturation. Increased monitoring of arterial roadside drains and natural hillside drainage channels required.
            </p>
            <div style="font-size: 0.78rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <strong>Action:</strong> Community radio advisories; inspect culvert blockages.
            </div>
          </div>

          <!-- Watch Tier -->
          <div class="glass-panel" style="padding: 24px; border-top: 4px solid var(--risk-high);">
            <span class="badge badge-high" style="margin-bottom: 8px;">TIER 2 · WATCH</span>
            <h3 style="margin: 0 0 6px 0; font-size: 1.2rem; color: #FFFFFF;">High Susceptibility</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Composite Risk Score: 70.0 – 84.9</span>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin: 12px 0;">
              Significant pore pressure elevation. Precautionary evacuation preparations for vulnerable households along steep cut slopes and river talwegs.
            </p>
            <div style="font-size: 0.78rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <strong>Action:</strong> Mobilize SDRF rescue vehicles; alert village disaster committees.
            </div>
          </div>

          <!-- Warning Tier -->
          <div class="glass-panel" style="padding: 24px; border-top: 4px solid var(--risk-crit);">
            <span class="badge badge-crit" style="margin-bottom: 8px;">TIER 3 · WARNING</span>
            <h3 style="margin: 0 0 6px 0; font-size: 1.2rem; color: #FFFFFF;">Critical Susceptibility</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Composite Risk Score: 85.0 – 100.0</span>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin: 12px 0;">
              Severe geotechnical failure conditions. Ground saturation exceeds shear resistance limits. Immediate mandatory evacuation along identified escape vectors.
            </p>
            <div style="font-size: 0.78rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <strong>Action:</strong> Activate sirens, initiate community evacuations to designated shelters.
            </div>
          </div>
        </div>

        <!-- Rainfall Trigger Matrix -->
        <div class="glass-panel" style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 1.15rem; color: #FFFFFF;">
            Rainfall-Slope Empirical Trigger Threshold Matrix
          </h3>
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Terrain Slope Angle</th>
                  <th>Dry Baseline (24h)</th>
                  <th>Precipitation Trigger (24h)</th>
                  <th>Extreme Cloudburst (6h)</th>
                  <th>Failure Susceptibility</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>0° – 15° (Plains & Foothills)</strong></td>
                  <td>&lt; 50 mm</td>
                  <td>120 mm</td>
                  <td>80 mm</td>
                  <td><span class="badge badge-low">Low / Flood only</span></td>
                </tr>
                <tr>
                  <td><strong>15° – 28° (Moderate Slopes)</strong></td>
                  <td>&lt; 35 mm</td>
                  <td>80 mm</td>
                  <td>55 mm</td>
                  <td><span class="badge badge-mod">Moderate Debris</span></td>
                </tr>
                <tr>
                  <td><strong>28° – 40° (Steep Hillside Cuts)</strong></td>
                  <td>&lt; 20 mm</td>
                  <td>60 mm</td>
                  <td>40 mm</td>
                  <td><span class="badge badge-high">High Failure Strain</span></td>
                </tr>
                <tr>
                  <td><strong>&gt; 40° (Escarpments & Ghats)</strong></td>
                  <td>&lt; 15 mm</td>
                  <td>45 mm</td>
                  <td>30 mm</td>
                  <td><span class="badge badge-crit">Critical Mass Wasting</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }
};

export default EarlyWarningView;
