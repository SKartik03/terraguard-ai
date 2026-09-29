import React from 'react';
import { Layers, Database, Cpu, Server, Monitor, ShieldCheck, GitBranch, ArrowRight } from 'lucide-react';

export default function TechnicalArchitectureView() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Technical System Architecture</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          System components, local laptop runtime, zero-dependency SQLite architecture, and ML pipelines.
        </p>
      </div>

      {/* Component Stack Grid */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Monitor size={20} color="var(--sky-400)" />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Presentation Tier</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>Framework:</strong> React.js 18 + Vite</li>
            <li><strong>Styling:</strong> Custom Vanilla CSS Glassmorphism</li>
            <li><strong>GIS Mapping:</strong> Leaflet.js + OpenStreetMap</li>
            <li><strong>Data Visualization:</strong> Chart.js 4</li>
            <li><strong>Offline Resiliency:</strong> localStorage caching</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Server size={20} color="var(--emerald-400)" />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Application & API Tier</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>Framework:</strong> FastAPI (Python 3.14)</li>
            <li><strong>Validation:</strong> Pydantic v2 Type Enforcers</li>
            <li><strong>Server:</strong> Uvicorn ASGI on localhost:8000</li>
            <li><strong>Rule Engine:</strong> Deterministic Layer 1 math</li>
            <li><strong>External Proxy:</strong> Open-Meteo with timeout fallback</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Database size={20} color="var(--indigo-500)" />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Persistence & ML</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong>Active Database:</strong> SQLite 3 (<code style={{ color: 'var(--emerald-400)' }}>terraguard.db</code>)</li>
            <li><strong>PostgreSQL/PostGIS:</strong> Future planned upgrade</li>
            <li><strong>ML Engine:</strong> Scikit-learn Random Forest</li>
            <li><strong>Model Serialization:</strong> Joblib binary artifact</li>
            <li><strong>Zero Setup:</strong> Laptop-native execution</li>
          </ul>
        </div>
      </div>

      {/* Database Architectural Decision */}
      <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={20} color="var(--emerald-400)" /> Database Architecture: SQLite Today, PostGIS Tomorrow
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
          For rapid, robust, zero-configuration local laptop evaluation, <strong>SQLite 3</strong> is the exclusive active database runtime. SQLite satisfies 100% of the data requirements (locations table, 150 historical events, assessment audit log) without requiring judges to install external server daemons or manage credentials.
        </p>
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px 18px', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
          <strong style={{ color: 'var(--sky-400)' }}>Planned PostGIS Upgrade Path:</strong> The database schema is designed with dialect-agnostic column definitions. In a production cloud deployment, swapping from SQLite to PostgreSQL + PostGIS enables spatial indexing (<code style={{ color: 'var(--emerald-400)' }}>ST_DWithin</code>, <code style={{ color: 'var(--emerald-400)' }}>R-Tree</code>) for millions of DEM raster tiles without modifying frontend contracts.
        </div>
      </div>

      {/* Advanced Planned Model Notice */}
      <div className="glass-panel" style={{ padding: '24px 28px', borderLeft: '4px solid var(--sky-400)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Cpu size={20} color="var(--sky-400)" />
          <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Advanced / Planned Model Architecture</h3>
        </div>

        <div style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, color: 'var(--sky-400)', textTransform: 'uppercase', marginBottom: 12 }}>
          Not Implemented in This Prototype — Future Research Specification
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
          The conceptual next-generation machine learning architecture envisioned for TerraGuard AI combines 
          a <strong>2D Spatial CNN</strong> for feature extraction from digital elevation model (DEM) rasters, 
          a <strong>Bidirectional Long Short-Term Memory (BiLSTM)</strong> recurrent network to capture temporal hysteresis in antecedent rainfall accumulation, 
          and a <strong>Multi-Head Self-Attention Layer</strong> to dynamically weigh geological susceptibility factors.
        </p>

        {/* Conceptual Diagram */}
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: 20, borderRadius: 8, border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', overflowX: 'auto', lineHeight: 1.8, color: '#94A3B8' }}>
          [Elevation Raster (DEM)] ──→ [2D Spatial CNN Layers] ──────────┐<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──→ [Self-Attention Head] ──→ [Dense Softmax Risk]<br />
          [Precipitation Time-Series] → [BiLSTM Recurrent Stack] ────────┘
        </div>
      </div>
    </div>
  );
}
