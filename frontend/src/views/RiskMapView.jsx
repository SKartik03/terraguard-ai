import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Info, ArrowUpRight, Layers, Shield } from 'lucide-react';

const customIcon = (color) => new L.DivIcon({
  className: 'custom-pin',
  html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px ${color};"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export default function RiskMapView({ setView, setAssessmentParams }) {
  const [mapFeatures, setMapFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const res = await fetch('/api/risk-map');
        const data = await res.json();
        setMapFeatures(data.features || []);
        if (data.features && data.features.length > 0) {
          setSelectedSite(data.features[0]);
        }
      } catch (err) {
        console.warn("Using offline map features:", err);
        const fallback = [
          { id: 1, name: "Wayanad Vythiri Ghats", region: "Western Ghats, Kerala", coordinates: [11.5540, 76.0422], slope: 38.5, geology: "Weak", soil_moisture: 72.0, ndvi: 0.45, land_cover: "Barren", description: "Monsoonal fracture zone with extensive slope destabilization history.", risk_score: 78.4, risk_class: "HIGH", dominant_factor: "Rainfall Volume" },
          { id: 2, name: "Joshimath Subsidence Ridge", region: "Chamoli, Uttarakhand", coordinates: [30.5564, 79.5663], slope: 42.0, geology: "Weak", soil_moisture: 58.0, ndvi: 0.22, land_cover: "Barren", description: "Ancient landslide debris mound with active tectonic shearing.", risk_score: 86.2, risk_class: "CRITICAL", dominant_factor: "Terrain Slope Angle" },
          { id: 3, name: "Malin Hills Escarpment", region: "Pune Western Ghats, Maharashtra", coordinates: [19.1608, 73.6827], slope: 36.0, geology: "Weak", soil_moisture: 65.0, ndvi: 0.38, land_cover: "Agriculture", description: "Terraced basaltic hillslopes vulnerable to prolonged cloudburst saturation.", risk_score: 74.5, risk_class: "HIGH", dominant_factor: "Rainfall Volume" },
          { id: 4, name: "Nilgiris Coonoor Slopes", region: "Nilgiri Hills, Tamil Nadu", coordinates: [11.3530, 76.7959], slope: 28.0, geology: "Moderate", soil_moisture: 48.0, ndvi: 0.65, land_cover: "Grassland", description: "Lateritic clay formations on steep tea estate slopes.", risk_score: 52.8, risk_class: "MODERATE", dominant_factor: "Slope Angle" },
          { id: 5, name: "Shimla Upper Ridge", region: "Himachal Pradesh", coordinates: [31.1048, 77.1734], slope: 31.5, geology: "Moderate", soil_moisture: 42.0, ndvi: 0.58, land_cover: "Urban", description: "Overloaded ridge corridor with mixed phyllite-quartzite bedrock.", risk_score: 55.4, risk_class: "MODERATE", dominant_factor: "Slope Angle" },
          { id: 6, name: "Darjeeling Lebong Spur", region: "Eastern Himalayas, West Bengal", coordinates: [27.0410, 88.2663], slope: 34.0, geology: "Weak", soil_moisture: 62.0, ndvi: 0.40, land_cover: "Barren", description: "Gneissic weathered soil layers susceptible to debris flows.", risk_score: 76.1, risk_class: "HIGH", dominant_factor: "Geological Bedrock" }
        ];
        setMapFeatures(fallback);
        setSelectedSite(fallback[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, []);

  const getRiskColor = (cls) => {
    switch (cls) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MODERATE': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const handleAssessSite = (site) => {
    setAssessmentParams({
      location_name: site.name,
      latitude: site.coordinates[0],
      longitude: site.coordinates[1],
      rainfall_mm: 90.0,
      slope_deg: site.slope,
      soil_moisture_pct: site.soil_moisture,
      geology_condition: site.geology,
      ndvi: site.ndvi,
      land_cover: site.land_cover,
      window_hours: 24
    });
    setView('assessment');
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>GIS Geospatial Hazard Corridors</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Interactive OpenStreetMap visualization of high-risk mountain corridors across India.
          </p>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, background: 'rgba(15, 23, 42, 0.8)', padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} /> Critical (85+)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F97316' }} /> High (70-84)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} /> Moderate (40-69)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} /> Low (0-39)
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, height: 'calc(100vh - 220px)', minHeight: 520 }}>
        {/* Leaflet Map Canvas */}
        <div className="glass-panel" style={{ overflow: 'hidden', position: 'relative' }}>
          <MapContainer center={[22.5937, 78.9629]} zoom={4.6} style={{ height: '100%', width: '100%' }}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap Standard">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Esri World Imagery (Satellite)">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="OpenTopoMap (Topography)">
                <TileLayer
                  attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {mapFeatures.map((feat) => (
              <React.Fragment key={feat.id}>
                <Marker 
                  position={feat.coordinates}
                  icon={customIcon(getRiskColor(feat.risk_class))}
                  eventHandlers={{
                    click: () => setSelectedSite(feat)
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: 200, padding: 4 }}>
                      <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>{feat.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 3 }}>
                        Region: {feat.region}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: getRiskColor(feat.risk_class), fontWeight: 700, marginTop: 4 }}>
                        Baseline Risk: {feat.risk_score} ({feat.risk_class})
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
                        Slope: {feat.slope}° | Geology: {feat.geology}
                      </div>
                      <button 
                        onClick={() => handleAssessSite(feat)}
                        style={{ marginTop: 8, padding: '4px 10px', background: '#059669', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.72rem', width: '100%', fontWeight: 600 }}
                      >
                        Assess This Site
                      </button>
                    </div>
                  </Popup>
                </Marker>

                <Circle
                  center={feat.coordinates}
                  radius={45000}
                  pathOptions={{
                    color: getRiskColor(feat.risk_class),
                    fillColor: getRiskColor(feat.risk_class),
                    fillOpacity: 0.18,
                    weight: 1.5
                  }}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </div>

        {/* Selected Site Details Inspector */}
        <div className="glass-panel" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={16} color="var(--sky-400)" /> Site Geotechnical Inspector
          </h3>

          {selectedSite ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              <div style={{ padding: 12, background: 'rgba(15, 23, 42, 0.7)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corridor Node</div>
                <h4 style={{ fontSize: '1.1rem', margin: '2px 0 4px 0' }}>{selectedSite.name}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--sky-400)' }}>{selectedSite.region}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: 10, background: 'rgba(15, 23, 42, 0.5)', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Calculated Risk</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: getRiskColor(selectedSite.risk_class) }}>
                    {selectedSite.risk_score}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{selectedSite.risk_class}</span>
                </div>

                <div style={{ padding: 10, background: 'rgba(15, 23, 42, 0.5)', borderRadius: 6 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Slope Angle</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {selectedSite.slope}°
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Inclination</span>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bedrock Geology:</span>
                  <strong>{selectedSite.geology}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Baseline Soil Moisture:</span>
                  <strong>{selectedSite.soil_moisture}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vegetation (NDVI):</span>
                  <strong>{selectedSite.ndvi}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Land Cover:</span>
                  <strong>{selectedSite.land_cover}</strong>
                </div>
              </div>

              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 'auto', background: 'rgba(15, 23, 42, 0.5)', padding: 10, borderRadius: 6 }}>
                {selectedSite.description}
              </p>

              <button 
                onClick={() => handleAssessSite(selectedSite)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
              >
                Load In Risk Calculator <ArrowUpRight size={15} />
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
              Click on a map marker to inspect geotechnical parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
