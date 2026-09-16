import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, Download, ArrowUpDown, AlertCircle } from 'lucide-react';

export default function HistoricalEventsView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [rainfallFilter, setRainfallFilter] = useState('ALL');
  const [landslideOnly, setLandslideOnly] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let url = '/api/historical-events?limit=150';
        if (severityFilter !== 'ALL') url += `&severity=${severityFilter}`;
        if (landslideOnly) url += '&landslide_only=true';

        const res = await fetch(url);
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.warn("Using offline events fallback:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [severityFilter, landslideOnly]);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.location_name.toLowerCase().includes(search.toLowerCase()) || 
                          (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
    let matchesRain = true;
    if (rainfallFilter === 'gt150') matchesRain = e.rainfall_mm >= 150;
    else if (rainfallFilter === 'gt100') matchesRain = e.rainfall_mm >= 100;
    else if (rainfallFilter === 'gt50') matchesRain = e.rainfall_mm >= 50;

    return matchesSearch && matchesRain;
  });

  const exportCSV = () => {
    const headers = ["Date", "Location", "Latitude", "Longitude", "Rainfall_mm", "Slope_deg", "Soil_Moisture_pct", "Geology", "NDVI", "Land_Cover", "Landslide_Occurred", "Severity", "Casualties", "Damage_USD", "Notes"];
    const rows = filteredEvents.map(e => [
      e.event_date,
      `"${e.location_name}"`,
      e.latitude,
      e.longitude,
      e.rainfall_mm,
      e.slope_deg,
      e.soil_moisture_pct,
      e.geology_condition,
      e.ndvi,
      e.land_cover,
      e.landslide_occurred,
      e.severity,
      e.casualties,
      e.damage_est_usd,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraGuard_Historical_Landslides_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL': return <span className="badge badge-crit">CRITICAL</span>;
      case 'HIGH': return <span className="badge badge-high">HIGH</span>;
      case 'MODERATE': return <span className="badge badge-mod">MODERATE</span>;
      default: return <span className="badge badge-low">LOW</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Historical Landslide Archive</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Empirical ground-truth and calibration dataset ({events.length} benchmark events in SQLite).
          </p>
        </div>
        <button onClick={exportCSV} className="btn btn-primary btn-sm">
          <Download size={15} /> Export Dataset (CSV)
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input 
            type="text"
            className="form-control"
            placeholder="Search by location or incident notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={14} /> Severity:
          </span>
          <select 
            className="form-control form-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ width: 140, padding: '8px 12px' }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rainfall:</span>
          <select 
            className="form-control form-select"
            value={rainfallFilter}
            onChange={(e) => setRainfallFilter(e.target.value)}
            style={{ width: 140, padding: '8px 12px' }}
          >
            <option value="ALL">All Rainfall</option>
            <option value="gt50">&gt; 50 mm</option>
            <option value="gt100">&gt; 100 mm</option>
            <option value="gt150">&gt; 150 mm</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
          <input 
            type="checkbox"
            checked={landslideOnly}
            onChange={(e) => setLandslideOnly(e.target.checked)}
            style={{ accentColor: 'var(--emerald-500)' }}
          />
          Landslides Only
        </label>
      </div>

      {/* Events Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Location</th>
                <th>Rainfall</th>
                <th>Slope</th>
                <th>Moisture</th>
                <th>Geology</th>
                <th>NDVI</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Casualties</th>
                <th>Observations</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{evt.event_date}</td>
                    <td style={{ fontWeight: 600 }}>{evt.location_name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: evt.rainfall_mm >= 120 ? 'var(--risk-crit)' : 'var(--text-primary)' }}>
                      {evt.rainfall_mm} mm
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{evt.slope_deg}°</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{evt.soil_moisture_pct}%</td>
                    <td>{evt.geology_condition}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{evt.ndvi}</td>
                    <td>
                      {evt.landslide_occurred ? (
                        <span style={{ color: 'var(--risk-crit)', fontWeight: 600, fontSize: '0.75rem' }}>Landslide</span>
                      ) : (
                        <span style={{ color: 'var(--risk-low)', fontSize: '0.75rem' }}>Stable</span>
                      )}
                    </td>
                    <td>{getSeverityBadge(evt.severity)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: evt.casualties > 0 ? 'var(--risk-crit)' : 'var(--text-muted)' }}>
                      {evt.casualties}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 260 }}>
                      {evt.notes}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    No events matched the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
