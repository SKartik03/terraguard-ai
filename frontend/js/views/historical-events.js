/**
 * TerraGuard AI - Historical Landslide Events Catalog View (Vanilla JS)
 * Filterable data table of 165 verified historical disaster records
 * with live catalog synchronization trigger.
 */
import api from '../api.js';

export const HistoricalEventsView = {
  render(container, state, router) {
    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Header -->
        <div class="glass-panel" style="padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.8rem; margin: 0 0 4px 0; color: #FFFFFF;">Historical Landslide Disaster Catalog</h1>
            <span style="font-size: 0.82rem; color: var(--text-muted);">
              165 verified historical incidents from Geological Survey of India (GSI Bhukosh), NASA GLC, and NRSC/ISRO Landslide Atlas.
            </span>
          </div>

          <!-- Sync Trigger Card -->
          <div style="display: flex; align-items: center; gap: 10px; background: rgba(15, 23, 42, 0.6); padding: 8px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <span id="sync-status-indicator" style="font-size: 0.75rem; color: var(--emerald-400);">● Continuous Sync Active</span>
            <button id="btn-sync-catalog" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.75rem;">
              🔄 Sync Now
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="glass-panel" style="padding: 18px 20px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <!-- Text Search -->
          <input 
            type="text" 
            id="events-filter-search" 
            class="form-control" 
            placeholder="Search by location, district, or keyword..."
            style="flex: 1; min-width: 200px; font-size: 0.85rem;"
          />

          <!-- Severity Filter -->
          <select id="events-filter-severity" class="form-control" style="width: auto; font-size: 0.85rem;">
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MODERATE">Moderate Severity</option>
          </select>

          <!-- State Filter -->
          <select id="events-filter-state" class="form-control" style="width: auto; font-size: 0.85rem;">
            <option value="">All States / Regions</option>
            <option value="Kerala">Kerala</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Sikkim">Sikkim</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Assam">Assam</option>
          </select>

          <span id="events-count-label" style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
            Loading records...
          </span>
        </div>

        <!-- Events Table -->
        <div class="glass-panel" style="padding: 20px;">
          <div style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location Name</th>
                  <th>State / Region</th>
                  <th>Coordinates</th>
                  <th>Recorded Rainfall</th>
                  <th>Fatalities</th>
                  <th>Severity</th>
                  <th>Catalog Source</th>
                </tr>
              </thead>
              <tbody id="events-table-tbody">
                <tr>
                  <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    Loading catalog database...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    let allEvents = [];

    const renderTable = () => {
      const q = (document.getElementById('events-filter-search')?.value || '').toLowerCase().trim();
      const sev = document.getElementById('events-filter-severity')?.value || '';
      const st = document.getElementById('events-filter-state')?.value || '';
      const tbody = document.getElementById('events-table-tbody');
      const countEl = document.getElementById('events-count-label');

      if (!tbody) return;

      const filtered = allEvents.filter(ev => {
        const matchesQ = !q || (ev.location_name && ev.location_name.toLowerCase().includes(q)) || (ev.state && ev.state.toLowerCase().includes(q));
        const matchesSev = !sev || (ev.severity === sev || ev.risk_class === sev);
        const matchesSt = !st || (ev.state && ev.state.toLowerCase().includes(st.toLowerCase()));
        return matchesQ && matchesSev && matchesSt;
      });

      if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allEvents.length} records`;

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">
              No historical landslide incidents match the selected filters.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map(ev => {
        const isCrit = ev.severity === 'CRITICAL' || ev.risk_class === 'CRITICAL';
        return `
          <tr>
            <td style="font-size: 0.78rem; color: var(--text-muted);">${ev.event_date || '2024'}</td>
            <td><strong>${ev.location_name}</strong></td>
            <td style="color: var(--text-secondary);">${ev.state || 'India'}</td>
            <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
              ${ev.latitude.toFixed(4)}°, ${ev.longitude.toFixed(4)}°
            </td>
            <td><strong>${ev.rainfall_mm != null ? ev.rainfall_mm + ' mm' : '--'}</strong></td>
            <td style="color: ${ev.fatalities ? '#EF4444' : 'var(--text-muted)'}; font-weight: ${ev.fatalities ? '700' : '400'};">
              ${ev.fatalities || '0'}
            </td>
            <td>
              <span class="badge ${isCrit ? 'badge-crit' : (ev.severity === 'HIGH' ? 'badge-high' : 'badge-mod')}" style="font-size: 0.7rem;">
                ${ev.severity || 'HIGH'}
              </span>
            </td>
            <td>
              <span style="font-size: 0.75rem; color: var(--sky-400);">${ev.source_catalog}</span>
            </td>
          </tr>
        `;
      }).join('');
    };

    // Load initial events from API
    api.getHistoricalEvents(165, true).then(res => {
      allEvents = res.events || [];
      renderTable();
    }).catch(err => {
      const tbody = document.getElementById('events-table-tbody');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" style="color: #EF4444; padding: 20px; text-align: center;">Error loading events: ${err.message}</td></tr>`;
      }
    });

    // Attach filter listeners
    const sInput = document.getElementById('events-filter-search');
    const sSev = document.getElementById('events-filter-severity');
    const sSt = document.getElementById('events-filter-state');
    if (sInput) sInput.oninput = renderTable;
    if (sSev) sSev.onchange = renderTable;
    if (sSt) sSt.onchange = renderTable;

    // Manual sync trigger
    const syncBtn = document.getElementById('btn-sync-catalog');
    const syncInd = document.getElementById('sync-status-indicator');
    if (syncBtn) {
      syncBtn.onclick = async () => {
        syncBtn.textContent = "⏳ Syncing...";
        try {
          const res = await api.triggerSyncNow();
          if (syncInd) syncInd.textContent = "● Synced Just Now";
          alert(res.message || "Historical catalogs synchronized successfully!");
        } catch (err) {
          alert("Sync error: " + err.message);
        } finally {
          syncBtn.textContent = "🔄 Sync Now";
        }
      };
    }
  }
};

export default HistoricalEventsView;
