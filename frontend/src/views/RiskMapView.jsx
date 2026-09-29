import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Info, ArrowUpRight, Layers, Shield, Sparkles, Navigation, BookOpen } from 'lucide-react';

const pinIcon = (color) => new L.DivIcon({
  className: 'custom-pin',
  html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 10px ${color};"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const userPickIcon = new L.DivIcon({
  className: 'user-pick-pin',
  html: `<div style="background-color: #10B981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 16px #10B981; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">📍</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const historicalIcon = new L.DivIcon({
  className: 'historical-event-pin',
  html: `<div style="background-color: #EF4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px #EF4444;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function MapRecenter({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && target[0] && target[1]) {
      map.flyTo(target, Math.max(map.getZoom(), 8), { duration: 1.0 });
    }
  }, [target, map]);
  return null;
}

export default function RiskMapView({ 
  setView, 
  onStartLocationAnalysis,
  initialTarget = null
}) {
  const [mapFeatures, setMapFeatures] = useState([]);
  const [historicalEvents, setHistoricalEvents] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(
    initialTarget || { lat: 11.5540, lon: 76.0422, name: "Wayanad Vythiri Ghats", region: "Western Ghats, Kerala" }
  );
  const [loading, setLoading] = useState(true);
  const [showHistoryLayer, setShowHistoryLayer] = useState(true);
  const [showRiskBuffer, setShowRiskBuffer] = useState(true);

  // Fetch baseline corridors & historical landslide dataset
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const [featRes, histRes] = await Promise.all([
          fetch('/api/risk-map'),
          fetch('/api/historical-events?limit=80&landslide_only=true')
        ]);
        
        if (featRes.ok) {
          const fData = await featRes.json();
          setMapFeatures(fData.features || []);
        }
        if (histRes.ok) {
          const hData = await histRes.json();
          setHistoricalEvents(hData.events || []);
        }
      } catch (err) {
        console.warn("Map data fallback:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, []);

  const handleMapClick = async (lat, lon) => {
    const rLat = parseFloat(lat.toFixed(4));
    const rLon = parseFloat(lon.toFixed(4));

    try {
      const res = await fetch(`/api/reverse-geocode?lat=${rLat}&lon=${rLon}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPoint({
          lat: rLat,
          lon: rLon,
          name: data.name || `Point (${rLat}°, ${rLon}°)`,
          region: data.region || "Selected Map Location"
        });
      }
    } catch {
      setSelectedPoint({
        lat: rLat,
        lon: rLon,
        name: `Selected Coordinates (${rLat}°, ${rLon}°)`,
        region: "User Coordinate Pick"
      });
    }
  };

  const getRiskColor = (cls) => {
    switch (cls) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MODERATE': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const handleAnalyzeSelected = () => {
    if (onStartLocationAnalysis) {
      onStartLocationAnalysis(selectedPoint.lat, selectedPoint.lon, selectedPoint.name);
    } else {
      setView('assessment');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header with Title & Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 2 }}>Interactive Geospatial Risk Map</h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Click anywhere on the map to place a target marker and run a location-first landslide assessment.
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, background: 'rgba(15, 23, 42, 0.8)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.74rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} /> 📍 Selected Location
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} /> Historical Landslides
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} /> Monitored Corridors
          </div>
        </div>
      </div>

      {/* Main Map + Inspector Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, height: 'calc(100vh - 220px)', minHeight: 520 }}>
        
        {/* Leaflet Canvas */}
        <div className="glass-panel" style={{ overflow: 'hidden', position: 'relative' }}>
          
          {/* Layer Quick Toggles */}
          <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 500, display: 'flex', gap: 8 }}>
            <button 
              onClick={() => setShowHistoryLayer(!showHistoryLayer)}
              style={{ background: showHistoryLayer ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.8)', border: `1px solid ${showHistoryLayer ? '#EF4444' : 'var(--border-subtle)'}`, color: 'white', borderRadius: 6, padding: '4px 10px', fontSize: '0.74rem', cursor: 'pointer' }}
            >
              {showHistoryLayer ? "Hide Historical Pins" : "Show Historical Pins"}
            </button>
            <button 
              onClick={() => setShowRiskBuffer(!showRiskBuffer)}
              style={{ background: showRiskBuffer ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.8)', border: `1px solid ${showRiskBuffer ? '#10B981' : 'var(--border-subtle)'}`, color: 'white', borderRadius: 6, padding: '4px 10px', fontSize: '0.74rem', cursor: 'pointer' }}
            >
              {showRiskBuffer ? "Hide 25km Buffer" : "Show 25km Buffer"}
            </button>
          </div>

          <MapContainer 
            center={[selectedPoint.lat, selectedPoint.lon]} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler onMapClick={handleMapClick} />
            <MapRecenter target={[selectedPoint.lat, selectedPoint.lon]} />

            {/* Selected Location Marker */}
            {selectedPoint && (
              <>
                <Marker position={[selectedPoint.lat, selectedPoint.lon]} icon={userPickIcon}>
                  <Popup>
                    <div style={{ color: '#0F172A', padding: '4px' }}>
                      <strong style={{ fontSize: '0.92rem' }}>📍 Selected Location</strong>
                      <div style={{ fontSize: '0.82rem', marginTop: 2 }}>{selectedPoint.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{selectedPoint.lat}°N, {selectedPoint.lon}°E</div>
                      <button 
                        onClick={handleAnalyzeSelected}
                        style={{ marginTop: 8, background: '#10B981', color: 'white', border: 'none', borderRadius: 4, padding: '6px 10px', fontSize: '0.76rem', cursor: 'pointer', width: '100%', fontWeight: 700 }}
                      >
                        🔍 Analyze This Location
                      </button>
                    </div>
                  </Popup>
                </Marker>

                {showRiskBuffer && (
                  <Circle 
                    center={[selectedPoint.lat, selectedPoint.lon]} 
                    radius={25000} 
                    pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.12, weight: 1.5, dashArray: '4, 4' }} 
                  />
                )}
              </>
            )}

            {/* Historical Landslide Event Pins */}
            {showHistoryLayer && historicalEvents.map((evt, idx) => (
              <Marker 
                key={idx} 
                position={[evt.latitude, evt.longitude]} 
                icon={historicalIcon}
              >
                <Popup>
                  <div style={{ color: '#0F172A', minWidth: 200, padding: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                      <strong style={{ fontSize: '0.86rem' }}>Historical Landslide</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                      <div><strong>Date:</strong> {evt.event_date}</div>
                      <div><strong>Location:</strong> {evt.location_name}</div>
                      <div><strong>Rainfall:</strong> {evt.rainfall_mm} mm</div>
                      <div><strong>Severity:</strong> <span style={{ color: evt.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>{evt.severity}</span></div>
                      <div><strong>Source:</strong> GSI / NASA Historical Catalogue</div>
                      {evt.notes && <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>«{evt.notes}»</div>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Demonstration Hazard Corridors */}
            {mapFeatures.map((feat) => (
              <Marker 
                key={feat.id}
                position={feat.coordinates}
                icon={pinIcon(getRiskColor(feat.risk_class))}
                eventHandlers={{
                  click: () => setSelectedPoint({ lat: feat.coordinates[0], lon: feat.coordinates[1], name: feat.name, region: feat.region })
                }}
              >
                <Popup>
                  <div style={{ color: '#0F172A', minWidth: 190, padding: 4 }}>
                    <strong style={{ fontSize: '0.88rem' }}>{feat.name}</strong>
                    <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: 2 }}>{feat.region}</div>
                    <div style={{ fontSize: '0.78rem', color: getRiskColor(feat.risk_class), fontWeight: 700, marginTop: 4 }}>
                      Baseline Risk: {feat.risk_score} ({feat.risk_class})
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedPoint({ lat: feat.coordinates[0], lon: feat.coordinates[1], name: feat.name, region: feat.region });
                        handleAnalyzeSelected();
                      }}
                      style={{ marginTop: 6, background: '#0EA5E9', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: '0.74rem', cursor: 'pointer', width: '100%', fontWeight: 600 }}
                    >
                      Analyze Corridor
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

          </MapContainer>
        </div>

        {/* Right Sidebar: Selected Location Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--emerald-400)' }}>Active Location</strong>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: 4, color: 'white' }}>
              📍 {selectedPoint.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              {selectedPoint.region}
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
              <div>Latitude: <strong>{selectedPoint.lat}°N</strong></div>
              <div style={{ marginTop: 4 }}>Longitude: <strong>{selectedPoint.lon}°E</strong></div>
            </div>

            <button 
              onClick={handleAnalyzeSelected}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
            >
              <Sparkles size={16} /> 🔍 Analyze This Location
            </button>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', margin: '6px 0 0 0' }}>
              Queries 25km historical landslide proximity
            </p>
          </div>

          {/* Map Layer Legend & Stats Card */}
          <div className="glass-panel" style={{ padding: '18px 20px', flex: 1, fontSize: '0.82rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={16} color="var(--sky-400)" /> Map Layer Information
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'white' }}>Historical Database:</strong>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {historicalEvents.length} documented landslide records mapped from GSI Bhukosh & NASA GLC.
                </p>
              </div>

              <div>
                <strong style={{ color: 'white' }}>Proximity Search Buffer:</strong>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Dotted green circle represents the 25 km geotechnical proximity zone evaluated during risk calculation.
                </p>
              </div>

              <div>
                <strong style={{ color: 'white' }}>Click-on-Map Selection:</strong>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Click anywhere in India or global mountainous zones to position the analysis pin.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
