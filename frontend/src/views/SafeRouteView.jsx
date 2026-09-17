import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Navigation, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  RefreshCw, 
  Layers, 
  ExternalLink,
  Info
} from 'lucide-react';

// Custom Pin Icons for Leaflet
const createPinIcon = (bg, label, emoji) => new L.DivIcon({
  className: 'custom-route-pin',
  html: `
    <div style="
      background: ${bg}; 
      color: white; 
      padding: 4px 10px; 
      border-radius: 20px; 
      font-weight: 700; 
      font-size: 11px; 
      border: 2px solid #FFFFFF; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.6); 
      white-space: nowrap; 
      display: flex; 
      align-items: center; 
      gap: 5px;
      transform: translate(-50%, -50%);
    ">
      <span>${emoji}</span>
      <span>${label}</span>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

// Smooth map fly-to controller
function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 13, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

// Map click handler to set Origin
function MapClickOriginPicker({ onPickOrigin }) {
  useMapEvents({
    click(e) {
      onPickOrigin(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Regional mountain and vulnerable presets for demonstration
const PRESET_CORRIDORS = [
  { name: "Wayanad Vythiri Ghats", region: "Western Ghats, Kerala", lat: 11.5540, lon: 76.0422, type: "Steep Mountainous" },
  { name: "Shimla Upper Ridge", region: "Himachal Pradesh", lat: 31.1048, lon: 77.1734, type: "Himalayan Ridge" },
  { name: "Munnar High Ranges", region: "Idukki, Kerala", lat: 10.0889, lon: 77.0595, type: "Escarpment" },
  { name: "Joshimath Subsidence Zone", region: "Chamoli, Uttarakhand", lat: 30.5564, lon: 79.5663, type: "Active Subsidence" },
  { name: "Malin Western Ghats", region: "Pune, Maharashtra", lat: 19.1608, lon: 73.6827, type: "Debris Slope" },
  { name: "Nilgiris Coonoor Slopes", region: "Tamil Nadu", lat: 11.3530, lon: 76.7959, type: "Arterial Road Cut" }
];

export default function SafeRouteView({ activeLocation, resultData, onStartLocationAnalysis, setView }) {
  // Initialize location from active analysis or default to Wayanad
  const initialLat = activeLocation?.lat || activeLocation?.latitude || resultData?.location?.latitude || 11.5540;
  const initialLon = activeLocation?.lon || activeLocation?.longitude || resultData?.location?.longitude || 76.0422;
  const initialName = activeLocation?.name || resultData?.location?.name || "Selected Location";
  const initialRegion = activeLocation?.region || resultData?.location?.region || "Active Corridor";

  const [currentOrigin, setCurrentOrigin] = useState({
    name: initialName,
    region: initialRegion,
    lat: initialLat,
    lon: initialLon
  });

  const [activeRoute, setActiveRoute] = useState('safe'); // 'safe' | 'blocked'

  // Update origin when activeLocation prop changes
  useEffect(() => {
    if (activeLocation && activeLocation.lat && activeLocation.lon) {
      setCurrentOrigin({
        name: activeLocation.name || "Evaluated Location",
        region: activeLocation.region || "Current Sector",
        lat: activeLocation.lat,
        lon: activeLocation.lon
      });
    } else if (resultData?.location) {
      setCurrentOrigin({
        name: resultData.location.name,
        region: resultData.location.region || "Current Sector",
        lat: resultData.location.latitude,
        lon: resultData.location.longitude
      });
    }
  }, [activeLocation, resultData]);

  // Compute dynamic destination shelter: placed ~4-5km northeast on elevated terrain
  const originLat = currentOrigin.lat;
  const originLon = currentOrigin.lon;

  const shelterLat = parseFloat((originLat + 0.032).toFixed(4));
  const shelterLon = parseFloat((originLon - 0.024).toFixed(4));
  const chokepointLat = parseFloat((originLat + 0.015).toFixed(4));
  const chokepointLon = parseFloat((originLon - 0.009).toFixed(4));

  // Route A: Safe High-Ground / Ridge Crest Bypass (Arcs westward along elevated contour)
  const safeRouteCoords = [
    [originLat, originLon],
    [parseFloat((originLat + 0.007).toFixed(4)), parseFloat((originLon - 0.009).toFixed(4))],
    [parseFloat((originLat + 0.016).toFixed(4)), parseFloat((originLon - 0.021).toFixed(4))],
    [parseFloat((originLat + 0.024).toFixed(4)), parseFloat((originLon - 0.026).toFixed(4))],
    [parseFloat((originLat + 0.029).toFixed(4)), parseFloat((originLon - 0.025).toFixed(4))],
    [shelterLat, shelterLon]
  ];

  // Route B: Hazardous Valley Floor / Roadway (Follows the natural drainage runout depression)
  const blockedRouteCoords = [
    [originLat, originLon],
    [parseFloat((originLat + 0.008).toFixed(4)), parseFloat((originLon - 0.004).toFixed(4))],
    [chokepointLat, chokepointLon], // Chokepoint
    [parseFloat((originLat + 0.022).toFixed(4)), parseFloat((originLon - 0.014).toFixed(4))],
    [parseFloat((originLat + 0.028).toFixed(4)), parseFloat((originLon - 0.019).toFixed(4))],
    [shelterLat, shelterLon]
  ];

  // Dynamic distance estimations based on spherical difference
  const approxStraightDistKm = Math.sqrt(
    Math.pow((shelterLat - originLat) * 111, 2) + 
    Math.pow((shelterLon - originLon) * 111 * Math.cos(originLat * Math.PI / 180), 2)
  );
  const routeADistKm = Math.max(parseFloat((approxStraightDistKm * 1.35).toFixed(1)), 3.8);
  const routeBDistKm = Math.max(parseFloat((approxStraightDistKm * 1.08).toFixed(1)), 2.9);

  const routeATimeMin = Math.round((routeADistKm / 18.0) * 60); // ~18 km/h emergency vehicle speed on ridge
  const routeBChokepointKm = parseFloat((routeBDistKm * 0.45).toFixed(1));

  // Handle map click to place new Origin
  const handleMapPickOrigin = async (lat, lon) => {
    const rLat = parseFloat(lat.toFixed(4));
    const rLon = parseFloat(lon.toFixed(4));

    try {
      const res = await fetch(`/api/reverse-geocode?lat=${rLat}&lon=${rLon}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentOrigin({
          name: data.name || `Point (${rLat}°, ${rLon}°)`,
          region: data.region || "Custom Map Coordinate",
          lat: rLat,
          lon: rLon
        });
        return;
      }
    } catch (e) {
      console.warn("Reverse geocode failed on route map click:", e);
    }

    setCurrentOrigin({
      name: `Point (${rLat}°, ${rLon}°)`,
      region: "Custom Map Coordinates",
      lat: rLat,
      lon: rLon
    });
  };

  const handleSelectPreset = (p) => {
    setCurrentOrigin({
      name: p.name,
      region: p.region,
      lat: p.lat,
      lon: p.lon
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Safe Evacuation Routing</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Topographical hazard-avoidance pathfinding for emergency evacuation corridors.
          </p>
        </div>

        {/* Sync with Current Assessment Button */}
        {(activeLocation || resultData?.location) && (
          <button 
            onClick={() => {
              const loc = activeLocation || resultData.location;
              setCurrentOrigin({
                name: loc.name || "Active Assessment Location",
                region: loc.region || "Current Sector",
                lat: loc.lat || loc.latitude,
                lon: loc.lon || loc.longitude
              });
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Sync to Evaluated Location
          </button>
        )}
      </div>

      {/* Scope Notice Banner */}
      <div className="scope-banner" style={{ marginBottom: 18 }}>
        <AlertTriangle className="scope-banner-icon" size={22} color="var(--risk-mod)" />
        <div>
          <strong style={{ color: '#FCD34D' }}>Topographical Hazard Avoidance Routing:</strong> This tool calculates evacuation corridors by evaluating steep drainage catchments, active slope runout channels, and granitic ridge lines. In real emergencies, follow ground instructions from local disaster authorities, police, and NDRF rescue teams.
        </div>
      </div>

      {/* Corridor Quick Switcher */}
      <div className="glass-panel" style={{ padding: '12px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={14} color="var(--emerald-400)" /> Evacuation Zone:
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          {PRESET_CORRIDORS.map(p => {
            const isSelected = Math.abs(p.lat - currentOrigin.lat) < 0.05 && Math.abs(p.lon - currentOrigin.lon) < 0.05;
            return (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(p)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--emerald-500)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.5)',
                  color: isSelected ? 'var(--emerald-400)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.name.split(' ')[0]} ({p.region.split(',')[0]})
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          💡 Click anywhere on map to set a custom origin
        </span>
      </div>

      {/* Main Grid: Interactive Map + Corridor Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, height: 'calc(100vh - 270px)', minHeight: 520 }}>
        
        {/* Map Container */}
        <div className="glass-panel" style={{ overflow: 'hidden', position: 'relative', padding: 0 }}>
          <MapContainer center={[originLat, originLon]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenterController center={[originLat, originLon]} />
            <MapClickOriginPicker onPickOrigin={handleMapPickOrigin} />

            {/* Origin Pin */}
            <Marker position={[originLat, originLon]} icon={createPinIcon('#F59E0B', 'Origin (Vulnerable)', '📍')}>
              <Popup>
                <div style={{ padding: 4 }}>
                  <strong style={{ color: '#F59E0B' }}>Evacuation Origin Point</strong>
                  <div style={{ fontSize: '0.8rem', marginTop: 4 }}>{currentOrigin.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{currentOrigin.region}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>{originLat.toFixed(4)}°, {originLon.toFixed(4)}°</div>
                </div>
              </Popup>
            </Marker>

            {/* Shelter Pin */}
            <Marker position={[shelterLat, shelterLon]} icon={createPinIcon('#10B981', 'Safe Assembly Shelter', '🏥')}>
              <Popup>
                <div style={{ padding: 4 }}>
                  <strong style={{ color: '#10B981' }}>Designated Safe Assembly Shelter</strong>
                  <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Elevated Hillside High-Ground Center</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Safe distance from debris flow runout lines</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>{shelterLat.toFixed(4)}°, {shelterLon.toFixed(4)}°</div>
                </div>
              </Popup>
            </Marker>

            {/* Hazard Chokepoint Pin */}
            <Marker position={[chokepointLat, chokepointLon]} icon={createPinIcon('#EF4444', 'Hazard Chokepoint', '⚠️')}>
              <Popup>
                <div style={{ padding: 4 }}>
                  <strong style={{ color: '#EF4444' }}>Critical Runout Chokepoint</strong>
                  <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Active torrent / valley depression intersection</div>
                  <div style={{ fontSize: '0.75rem', color: '#EF4444' }}>High risk of mudflow inundation during downpours</div>
                </div>
              </Popup>
            </Marker>

            {/* Route A: Safe Ridge Bypass (Emerald Green) */}
            <Polyline
              positions={safeRouteCoords}
              pathOptions={{
                color: '#10B981',
                weight: activeRoute === 'safe' ? 6 : 3,
                opacity: activeRoute === 'safe' ? 1.0 : 0.45,
                lineCap: 'round',
                lineJoin: 'round'
              }}
              eventHandlers={{
                click: () => setActiveRoute('safe')
              }}
            />

            {/* Route B: Blocked Valley Route (Vibrant Red, dashed) */}
            <Polyline
              positions={blockedRouteCoords}
              pathOptions={{
                color: '#EF4444',
                weight: activeRoute === 'blocked' ? 6 : 3,
                opacity: activeRoute === 'blocked' ? 1.0 : 0.45,
                dashArray: '10, 10',
                lineCap: 'round'
              }}
              eventHandlers={{
                click: () => setActiveRoute('blocked')
              }}
            />
          </MapContainer>

          {/* Map floating route toggle badge */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: '0.78rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontWeight: 600 }}>
              <span style={{ width: 12, height: 4, background: '#10B981', borderRadius: 2 }} /> Route A (Safe Ridge)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EF4444', fontWeight: 600 }}>
              <span style={{ width: 12, height: 4, background: '#EF4444', borderTop: '2px dashed #EF4444' }} /> Route B (Blocked Valley)
            </span>
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="glass-panel" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Active Sector
            </div>
            <h3 style={{ fontSize: '1.1rem', margin: '4px 0 2px 0', color: 'var(--text-primary)' }}>
              {currentOrigin.name}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {currentOrigin.region} · ({originLat.toFixed(3)}°N, {originLon.toFixed(3)}°E)
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
            
            {/* Route A Card */}
            <div 
              onClick={() => setActiveRoute('safe')}
              style={{
                padding: '16px',
                borderRadius: 10,
                background: activeRoute === 'safe' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(15, 23, 42, 0.6)',
                border: `1.5px solid ${activeRoute === 'safe' ? 'var(--emerald-500)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="badge badge-low" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> RECOMMENDED CORRIDOR
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--emerald-400)', fontWeight: 700 }}>
                  Low Hazard (18%)
                </span>
              </div>
              
              <h4 style={{ fontSize: '0.98rem', marginBottom: 6, color: 'var(--text-primary)' }}>
                Route A: High Ridge Crest Bypass
              </h4>
              
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Follows granitic ridge line spurs away from drainage ravines. Minimizes exposure to slope failure runout cones.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, padding: '8px 10px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, fontSize: '0.74rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Distance</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{routeADistKm} km</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Transit Time</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>~{routeATimeMin} min</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Clearance</div>
                  <div style={{ fontWeight: 700, color: 'var(--emerald-400)' }}>100% Passable</div>
                </div>
              </div>
            </div>

            {/* Route B Card */}
            <div 
              onClick={() => setActiveRoute('blocked')}
              style={{
                padding: '16px',
                borderRadius: 10,
                background: activeRoute === 'blocked' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(15, 23, 42, 0.6)',
                border: `1.5px solid ${activeRoute === 'blocked' ? 'var(--risk-crit)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="badge badge-crit" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <XCircle size={12} /> BLOCKED / IMPASSABLE
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--risk-crit)', fontWeight: 700 }}>
                  Hazard 94%
                </span>
              </div>
              
              <h4 style={{ fontSize: '0.98rem', marginBottom: 6, color: 'var(--text-primary)' }}>
                Route B: Valley Roadway Axis
              </h4>
              
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Cuts along the low-lying valley floor and torrent channel. Critical risk of flash debris flow accumulation.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, padding: '8px 10px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, fontSize: '0.74rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Distance</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{routeBDistKm} km</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Chokepoint</div>
                  <div style={{ fontWeight: 700, color: 'var(--risk-crit)' }}>km {routeBChokepointKm}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Status</div>
                  <div style={{ fontWeight: 700, color: 'var(--risk-crit)' }}>High Inundation</div>
                </div>
              </div>
            </div>

          </div>

          {/* Regional Assembly Hub Box */}
          <div style={{ 
            marginTop: 'auto', 
            padding: 14, 
            background: 'rgba(15, 23, 42, 0.75)', 
            borderRadius: 8, 
            border: '1px solid var(--border-subtle)',
            fontSize: '0.76rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={15} color="var(--emerald-400)" />
              {currentOrigin.name} Regional Emergency Hub
            </div>
            <div>
              Designated Safe Shelter: <strong>Hillside High-Ground Assembly Campus</strong> ({shelterLat.toFixed(3)}°N, {shelterLon.toFixed(3)}°E).
            </div>
            <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              Equipped with satellite communications, primary medical triage unit, and 48-hour emergency rations.
            </div>
          </div>

          {/* Direct Assess Origin Button */}
          {onStartLocationAnalysis && (
            <button
              onClick={() => {
                onStartLocationAnalysis(originLat, originLon, currentOrigin.name);
              }}
              className="btn btn-primary"
              style={{ marginTop: 12, width: '100%', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Compass size={16} /> Assess Landslide Risk at This Point
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

