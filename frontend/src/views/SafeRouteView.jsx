import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Compass, ShieldCheck, AlertTriangle, ArrowRight, Navigation, CheckCircle2, XCircle } from 'lucide-react';

const pinIcon = (color, label) => new L.DivIcon({
  className: 'custom-route-pin',
  html: `<div style="background: ${color}; color: white; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.5); white-space: nowrap;">${label}</div>`,
  iconSize: [60, 24],
  iconAnchor: [30, 12]
});

export default function SafeRouteView() {
  const [activeRoute, setActiveRoute] = useState('safe');

  // Wayanad Corridor Simulation coordinates
  // Start: Chooralmala / Meppadi settlement (11.5230, 76.1550)
  // End: Safe Shelter at Meppadi Higher Secondary School Ridge (11.5580, 76.1250)
  const startCoords = [11.5230, 76.1550];
  const endCoords = [11.5580, 76.1250];

  // Safe Ridge Route (Green - stays on high metamorphic ridge lines)
  const safeRouteCoords = [
    [11.5230, 76.1550],
    [11.5290, 76.1500],
    [11.5360, 76.1420],
    [11.5450, 76.1360],
    [11.5520, 76.1300],
    [11.5580, 76.1250]
  ];

  // Blocked Valley Route (Red - cuts through debris flow runout ravine)
  const blockedRouteCoords = [
    [11.5230, 76.1550],
    [11.5270, 76.1460],
    [11.5330, 76.1380], // Hazard choke point
    [11.5420, 76.1320],
    [11.5510, 76.1280],
    [11.5580, 76.1250]
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Safe Evacuation Routing (Prototype)</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Topographical hazard-avoidance routing for emergency evacuation corridors.
        </p>
      </div>

      {/* Scope Notice */}
      <div className="scope-banner" style={{ marginBottom: 24 }}>
        <AlertTriangle className="scope-banner-icon" size={22} color="var(--risk-mod)" />
        <div>
          <strong style={{ color: '#FCD34D' }}>Prototype Routing Demonstration:</strong> This tool illustrates topological risk overlay on evacuation pathfinding. In actual emergencies, routing must be verified on the ground by police, fire services, and NDRF rescue teams.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, height: 'calc(100vh - 230px)', minHeight: 520 }}>
        {/* Leaflet Map Canvas */}
        <div className="glass-panel" style={{ overflow: 'hidden', position: 'relative' }}>
          <MapContainer center={[11.5400, 76.1400]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Start Pin */}
            <Marker position={startCoords} icon={pinIcon('#F59E0B', 'Settlement Origin')}>
              <Popup>Settlement Zone (Vulnerable Downslope)</Popup>
            </Marker>

            {/* End Pin */}
            <Marker position={endCoords} icon={pinIcon('#10B981', 'Ridge Shelter')}>
              <Popup>Designated Emergency Assembly Point</Popup>
            </Marker>

            {/* Safe Route (Green Polyline) */}
            <Polyline
              positions={safeRouteCoords}
              pathOptions={{
                color: '#10B981',
                weight: activeRoute === 'safe' ? 6 : 3,
                opacity: activeRoute === 'safe' ? 1.0 : 0.4,
                dashArray: null
              }}
            />

            {/* Blocked Hazardous Route (Red Polyline) */}
            <Polyline
              positions={blockedRouteCoords}
              pathOptions={{
                color: '#EF4444',
                weight: activeRoute === 'blocked' ? 6 : 3,
                opacity: activeRoute === 'blocked' ? 1.0 : 0.4,
                dashArray: '8, 8'
              }}
            />
          </MapContainer>
        </div>

        {/* Route Details & Comparison */}
        <div className="glass-panel" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={18} color="var(--emerald-400)" /> Evacuation Corridor Analysis
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
            {/* Route A Card */}
            <div 
              onClick={() => setActiveRoute('safe')}
              style={{
                padding: '14px 16px',
                borderRadius: 8,
                background: activeRoute === 'safe' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${activeRoute === 'safe' ? 'var(--emerald-500)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>RECOMMENDED ROUTE</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600 }}>Low Hazard (18%)</span>
              </div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Route A: High Ridge Crest Bypass</h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                Trajectory follows stable granitic ridge spurs away from drainage channels.
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Dist: <strong>6.8 km</strong></span>
                <span>Time: <strong>~22 min</strong></span>
                <span>Clearance: <strong>100%</strong></span>
              </div>
            </div>

            {/* Route B Card */}
            <div 
              onClick={() => setActiveRoute('blocked')}
              style={{
                padding: '14px 16px',
                borderRadius: 8,
                background: activeRoute === 'blocked' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${activeRoute === 'blocked' ? 'var(--risk-crit)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="badge badge-crit" style={{ fontSize: '0.7rem' }}>BLOCKED / IMPASSABLE</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--risk-crit)', fontWeight: 600 }}>Hazard 94%</span>
              </div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Route B: Valley Roadway NH-66</h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                Traverses active torrent channel. Severe risk of flash debris flow inundation.
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Dist: <strong>4.2 km</strong></span>
                <span>Chokepoint: <strong>km 2.4</strong></span>
                <span>Status: <strong style={{ color: 'var(--risk-crit)' }}>Blocked</strong></span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: 12, background: 'rgba(15, 23, 42, 0.7)', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Evacuation Hub:</strong> Meppadi Ridge Community School Shelter (Capacity: 850 persons, satellite comms equipped).
          </div>
        </div>
      </div>
    </div>
  );
}
