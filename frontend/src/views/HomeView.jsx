import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Search, 
  Navigation, 
  ChevronRight, 
  Sparkles, 
  CheckCircle, 
  Layers, 
  Info,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Leaflet custom pin icons
const userLocationIcon = new L.DivIcon({
  className: 'custom-pin-user',
  html: `<div style="background: #10B981; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 16px #10B981; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">📍</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Helper component for map clicks
function MapClickPicker({ onPickLocation }) {
  useMapEvents({
    click(e) {
      onPickLocation(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Helper component to center map smoothly
function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, Math.max(map.getZoom(), 8), { duration: 1.0 });
    }
  }, [center, map]);
  return null;
}

export default function HomeView({ setView, onStartLocationAnalysis }) {
  // Location selection state
  const [selectedLocation, setSelectedLocation] = useState({
    name: "Wayanad Vythiri Ghats",
    region: "Western Ghats, Kerala",
    lat: 11.5540,
    lon: 76.0422
  });

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Geolocation Handler
  const handleUseCurrentLocation = () => {
    setGeoError(null);
    setGeoLoading(true);

    if (!navigator.geolocation) {
      setGeoError("Browser geolocation is not supported on this device. You can search for a location or select a point directly on the map.");
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));

        try {
          // Reverse geocode
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedLocation({
              name: data.name || "Your Current Location",
              region: data.region || "Current Coordinates",
              lat,
              lon
            });
          } else {
            setSelectedLocation({
              name: "Your Current Location",
              region: "Device Geolocation",
              lat,
              lon
            });
          }
        } catch {
          setSelectedLocation({
            name: "Your Current Location",
            region: "Device Geolocation",
            lat,
            lon
          });
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        setGeoLoading(false);
        setGeoError(
          "Location access was not available. You can search for a location or select a point directly on the map."
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Search query with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setSearchOpen(true);
        }
      } catch (e) {
        console.warn("Geocode error:", e);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click on map handler
  const handleMapPick = async (lat, lon) => {
    const rLat = parseFloat(lat.toFixed(4));
    const rLon = parseFloat(lon.toFixed(4));

    try {
      const res = await fetch(`/api/reverse-geocode?lat=${rLat}&lon=${rLon}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedLocation({
          name: data.name || `Point (${rLat}°, ${rLon}°)`,
          region: data.region || "Selected Map Point",
          lat: rLat,
          lon: rLon
        });
      }
    } catch {
      setSelectedLocation({
        name: `Selected Coordinates (${rLat}°, ${rLon}°)`,
        region: "Map Coordinate Selection",
        lat: rLat,
        lon: rLon
      });
    }
  };

  // Select Search Result
  const handleSelectSearchResult = (item) => {
    setSelectedLocation({
      name: item.name,
      region: item.region || item.country || "Geographic Area",
      lat: item.latitude,
      lon: item.longitude
    });
    setSearchQuery('');
    setSearchOpen(false);
  };

  // Trigger Analysis
  const handleTriggerAnalysis = () => {
    if (onStartLocationAnalysis) {
      onStartLocationAnalysis(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
    } else {
      setView('assessment');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Scope Honesty Banner */}
      <div className="scope-banner" style={{ marginBottom: 20 }}>
        <AlertTriangle className="scope-banner-icon" size={20} />
        <div>
          <strong style={{ color: '#FCD34D' }}>Scope Honesty & Operational Boundaries:</strong> TerraGuard AI is a location-aware prototype platform. It synthesizes historical landslide evidence, digital elevation models, and real-time atmospheric telemetry. It does <em>not</em> claim 100% certainty, exact occurrence timestamps, or replace official national disaster-management advisories.
        </div>
      </div>

      {/* Hero Header */}
      <div className="glass-panel" style={{ padding: '36px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 20, color: 'var(--emerald-400)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 14 }}>
          <Shield size={14} /> Location-Aware Landslide Risk Platform · AI for Climate Change
        </div>

        <h1 style={{ fontSize: '2.4rem', lineHeight: 1.18, marginBottom: 10, maxWidth: 840 }}>
          TerraGuard AI — <span style={{ background: 'linear-gradient(135deg, var(--emerald-400), #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Location-Aware Landslide Risk Assessment</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 760, marginBottom: 22, lineHeight: 1.5 }}>
          «Analyze a location using historical landslide evidence and currently available environmental and geographic conditions.»
        </p>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={handleUseCurrentLocation} 
            disabled={geoLoading}
            className="btn btn-primary" 
            style={{ padding: '12px 22px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {geoLoading ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
            📍 Use My Current Location
          </button>

          <button 
            onClick={() => {
              const el = document.getElementById('location-search-input');
              if (el) el.focus();
            }} 
            className="btn btn-secondary" 
            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Search size={17} /> 🔎 Search Location
          </button>

          <button 
            onClick={() => {
              const el = document.getElementById('interactive-map-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="btn btn-secondary" 
            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <MapPin size={17} /> 🗺 Select on Map
          </button>
        </div>

        {/* Geolocation Denial / Error Notice */}
        {geoError && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 8, color: '#FCA5A5', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              {geoError}
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Location Section: Search & Map Early in the User Journey */}
      <div id="interactive-map-anchor" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, marginBottom: 28 }}>
        
        {/* Left Control Column: Search Bar & Location Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Location Search Bar Card */}
          <div className="glass-panel" style={{ padding: '20px', position: 'relative' }} ref={searchContainerRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Search size={18} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Search Any Location</h3>
            </div>
            
            <div style={{ position: 'relative' }}>
              <input 
                id="location-search-input"
                type="text"
                className="input-control"
                placeholder="E.g. Kopargaon, Pune, Wayanad, Munnar, Shimla..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
                style={{ paddingLeft: 34 }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 12 }} />
              {searchLoading && (
                <Loader2 className="animate-spin" size={16} color="var(--emerald-400)" style={{ position: 'absolute', right: 10, top: 12 }} />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: 96, left: 16, right: 16, background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: 8, boxShadow: '0 12px 28px rgba(0,0,0,0.5)', zIndex: 1000, maxHeight: 220, overflowY: 'auto' }}>
                {searchResults.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelectSearchResult(item)}
                    style={{ padding: '10px 12px', borderBottom: idx < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                    className="hover-card"
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.region} · {item.latitude}°, {item.longitude}°</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Popular:</span>
              {[
                { name: "Wayanad", lat: 11.5540, lon: 76.0422 },
                { name: "Kopargaon", lat: 19.8833, lon: 74.4833 },
                { name: "Pune", lat: 18.5204, lon: 73.8567 },
                { name: "Munnar", lat: 10.0889, lon: 77.0595 }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedLocation({ name: p.name, region: "Demonstration Area", lat: p.lat, lon: p.lon })}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '2px 8px', fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Selected Location Card */}
          <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--emerald-400)', boxShadow: '0 0 8px var(--emerald-400)' }} />
              <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--emerald-400)' }}>Active Assessment Target</strong>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: 4, color: 'white' }}>
              📍 {selectedLocation.name}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              {selectedLocation.region}
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', marginBottom: 18 }}>
              <span>Latitude: <strong>{selectedLocation.lat}°N</strong></span>
              <span>Longitude: <strong>{selectedLocation.lon}°E</strong></span>
            </div>

            <button 
              onClick={handleTriggerAnalysis}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '0.98rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)' }}
            >
              <Sparkles size={18} /> 🔍 Analyze This Location
            </button>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', margin: '8px 0 0 0' }}>
              Checks 25km historical landslide archive & live atmospheric telemetry
            </p>
          </div>

          {/* Quick Guidance */}
          <div className="glass-panel" style={{ padding: '16px 18px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>
              <Info size={15} color="var(--cyan-400)" /> Click-on-Map Feature
            </div>
            You can also click anywhere on the adjacent map to place the location marker and assess that geographic coordinate.
          </div>

        </div>

        {/* Right Column: Early Interactive Map */}
        <div className="glass-panel" style={{ padding: '8px', minHeight: 460, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 18, left: 20, zIndex: 500, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            <span>Click anywhere on the map to select coordinates</span>
          </div>

          <MapContainer 
            center={[selectedLocation.lat, selectedLocation.lon]} 
            zoom={7} 
            style={{ height: '100%', minHeight: 440, width: '100%', borderRadius: 8 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapClickPicker onPickLocation={handleMapPick} />
            <MapCenterController center={[selectedLocation.lat, selectedLocation.lon]} />

            {/* Selected Location Marker */}
            <Marker position={[selectedLocation.lat, selectedLocation.lon]} icon={userLocationIcon}>
              <Popup>
                <div style={{ color: '#0F172A', padding: '4px 2px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>📍 Selected Location</strong>
                  <div style={{ fontSize: '0.82rem', marginTop: 2 }}>{selectedLocation.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedLocation.lat}°N, {selectedLocation.lon}°E</div>
                  <button 
                    onClick={handleTriggerAnalysis}
                    style={{ marginTop: 8, background: '#10B981', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', width: '100%', fontWeight: 600 }}
                  >
                    Analyze This Location
                  </button>
                </div>
              </Popup>
            </Marker>

            {/* 25 km Proximity Radius Indicator */}
            <Circle 
              center={[selectedLocation.lat, selectedLocation.lon]} 
              radius={25000} 
              pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.12, weight: 1.5, dashArray: '4, 4' }} 
            />
          </MapContainer>
        </div>

      </div>

      {/* Workflow Explanatory Section */}
      <div className="glass-panel" style={{ padding: '24px 26px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Shield size={20} color="var(--emerald-400)" />
          <h3 style={{ fontSize: '1.15rem', margin: 0 }}>How TerraGuard AI Evaluates a Location</h3>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Unlike generic forms requiring manual data entry, TerraGuard AI orchestrates a multi-source data pipeline for your selected coordinates:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { num: "01", title: "Coordinates & Proximity", desc: "Acquires latitude/longitude and scans 150+ historical records within a 25 km radius." },
            { num: "02", title: "Dual-Mode Architecture", desc: "Selects Mode A (Historical + Current) if past slides exist, or Mode B (Current Conditions Only) if none." },
            { num: "03", title: "Live Atmospheric Data", desc: "Fetches live precipitation, 24h forecast, and temperature telemetry from Open-Meteo." },
            { num: "04", title: "Dynamic Normalization", desc: "Unavailable factors are dynamically re-weighted instead of falsely assuming zero risk." },
            { num: "05", title: "Explainable Assessment", desc: "Synthesizes dominant risk contributors and explicit safety disclaimers." }
          ].map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '14px 16px' }}>
              <span style={{ color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>{item.num}</span>
              <h4 style={{ fontSize: '0.9rem', margin: '6px 0 4px 0' }}>{item.title}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
