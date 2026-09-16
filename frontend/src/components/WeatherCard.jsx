import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Droplets, Thermometer, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function WeatherCard({ lat = 11.5540, lon = 76.0422, locationName = "Western Ghats Baseline" }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forceOffline, setForceOffline] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    if (forceOffline) {
      // Simulate failure fallback
      setTimeout(() => {
        setWeather({
          status: "fallback_offline",
          temperature: 23.4,
          relative_humidity: 86,
          precipitation_mm: 18.5,
          wind_speed_kmh: 14.2,
          weather_condition: "Showers (Offline Simulation)",
          source: "Offline Meteorological Baseline",
          disclaimer: "Live weather is for atmospheric demonstration only. Historical risk model operates independently."
        });
        setLoading(false);
      }, 300);
      return;
    }

    try {
      const res = await fetch(`/api/live-weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Weather request failed");
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.warn("Weather API fallback triggered:", err);
      setWeather({
        status: "fallback_offline",
        temperature: 24.1,
        relative_humidity: 82,
        precipitation_mm: 12.0,
        wind_speed_kmh: 11.5,
        weather_condition: "Scattered Rain (Fallback)",
        source: "Cached Regional Baseline",
        disclaimer: "Network call unavailable. Showing regional atmospheric baseline."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [lat, lon, forceOffline]);

  return (
    <div className="glass-panel" style={{ padding: '18px 20px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CloudRain size={20} color="var(--sky-400)" />
          <div>
            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Live Weather Demonstration</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{locationName}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={() => setForceOffline(!forceOffline)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.7rem', padding: '4px 8px' }}
            title="Toggle simulated network drop for resilience test"
          >
            {forceOffline ? "Simulating Offline" : "Online (Open-Meteo)"}
          </button>
          <button 
            onClick={fetchWeather} 
            className="btn btn-secondary btn-sm"
            style={{ padding: '5px 7px' }}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {weather && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, margin: '14px 0' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: 8 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Thermometer size={12} /> Temp
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                {weather.temperature}°C
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: 8 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Droplets size={12} /> Humidity
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--sky-400)', marginTop: 2 }}>
                {weather.relative_humidity}%
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: 8 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CloudRain size={12} /> Precip
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--emerald-400)', marginTop: 2 }}>
                {weather.precipitation_mm} mm
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: 8 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Wind size={12} /> Wind
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                {weather.wind_speed_kmh} km/h
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {weather.status === 'live' ? (
                <CheckCircle size={14} color="var(--emerald-400)" />
              ) : (
                <AlertTriangle size={14} color="var(--risk-mod)" />
              )}
              <span style={{ color: weather.status === 'live' ? 'var(--emerald-400)' : 'var(--risk-mod)' }}>
                {weather.weather_condition} ({weather.source})
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontStyle: 'italic' }}>
              Snapshot only · Historical ML operates separately
            </span>
          </div>
        </>
      )}
    </div>
  );
}
