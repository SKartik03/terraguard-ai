/**
 * TerraGuard AI - Technical Architecture View (Vanilla JS)
 * Architectural components, deployment topology, and data flow pipelines.
 */
export const TechnicalArchitectureView = {
  render(container) {
    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Header -->
        <div class="glass-panel" style="padding: 24px;">
          <h1 style="font-size: 1.8rem; margin: 0 0 6px 0; color: #FFFFFF;">System Architecture & Engineering Topology</h1>
          <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0; line-height: 1.5;">
            Zero-build lightweight frontend paired with a deterministic Python FastAPI backend, 
            local SQLite database, Scikit-Learn ML, and Google Gemini API integration.
          </p>
        </div>

        <!-- 3 Tier Architecture Cards -->
        <div class="grid-3">
          <!-- Tier 1: Frontend -->
          <div class="glass-panel" style="padding: 24px; border-top: 4px solid var(--emerald-500);">
            <span class="badge badge-low" style="margin-bottom: 8px;">TIER 1 · CLIENT INTERFACE</span>
            <h3 style="margin: 0 0 8px 0; font-size: 1.2rem; color: #FFFFFF;">Vanilla HTML/CSS/JS + Leaflet</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin-bottom: 12px;">
              Zero-bundle static web client utilizing native ES modules. Directly initializes Leaflet GIS maps without heavy virtual-DOM wrappers.
            </p>
            <ul style="color: var(--text-muted); font-size: 0.8rem; padding-left: 20px; line-height: 1.6;">
              <li>Plain HTML5 / Vanilla CSS3 Design System</li>
              <li>Pure ES6 Modules (Zero Webpack / Vite build lock)</li>
              <li>Leaflet 1.9.4 GIS Canvas (Dark Matter CartoDB)</li>
              <li>Hash-based router with state-preserving error boundaries</li>
            </ul>
          </div>

          <!-- Tier 2: Backend & ML -->
          <div class="glass-panel" style="padding: 24px; border-top: 4px solid var(--sky-400);">
            <span class="badge badge-mod" style="margin-bottom: 8px; background: rgba(56, 189, 248, 0.15); color: #38BDF8; border-color: rgba(56, 189, 248, 0.3);">
              TIER 2 · CORE BACKEND & ML
            </span>
            <h3 style="margin: 0 0 8px 0; font-size: 1.2rem; color: #FFFFFF;">FastAPI & Scikit-Learn</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin-bottom: 12px;">
              High-performance asynchronous Python REST engine providing sub-15ms risk calculations, spatial proximity math, and background catalog maintenance.
            </p>
            <ul style="color: var(--text-muted); font-size: 0.8rem; padding-left: 20px; line-height: 1.6;">
              <li>FastAPI + Uvicorn ASGI Server</li>
              <li>Random Forest Classifier (120 Estimators, joblib serialized)</li>
              <li>In-process continuous dataset maintenance scheduler</li>
              <li>Comprehensive Pydantic input validation & error shields</li>
            </ul>
          </div>

          <!-- Tier 3: Foundation Model & Data -->
          <div class="glass-panel" style="padding: 24px; border-top: 4px solid #F59E0B;">
            <span class="badge" style="margin-bottom: 8px; background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3);">
              TIER 3 · GEMINI AI & PERSISTENCE
            </span>
            <h3 style="margin: 0 0 8px 0; font-size: 1.2rem; color: #FFFFFF;">Gemini 2.5 Flash & SQLite 3</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin-bottom: 12px;">
              Grounded multimodal LLM invocation for non-technical explainability and civil alert synthesis, backed by a persistent relational database.
            </p>
            <ul style="color: var(--text-muted); font-size: 0.8rem; padding-left: 20px; line-height: 1.6;">
              <li>Google GenAI SDK (gemini-2.5-flash)</li>
              <li>SQLite 3 (165 verified historical disaster incidents)</li>
              <li>Open-Meteo High-Resolution Numerical Weather Proxy</li>
              <li>Copernicus 30m Digital Elevation Model (DEM)</li>
            </ul>
          </div>
        </div>

        <!-- Deployment Topology -->
        <div class="glass-panel" style="padding: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 1.2rem; color: #FFFFFF;">
            Production Cloud Topology (Render + Vercel)
          </h3>
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px; font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-secondary); line-height: 1.8;">
            <div>[Client Browser] <span style="color: var(--emerald-400);">--HTTP/2--&gt;</span> [Vercel Static Edge (index.html, styles.css, js/*)]</div>
            <div>[API Requests]  <span style="color: var(--sky-400);">--Vercel Rewrites (/api/*)--&gt;</span> [Render Web Service (FastAPI / Uvicorn)]</div>
            <div>[Backend Logic] <span style="color: #A78BFA;">--In-Memory / Local Disk--&gt;</span> [terraguard.db SQLite & model.joblib]</div>
            <div>[Explainability] <span style="color: #F59E0B;">--Secure HTTPS--&gt;</span> [Google Gemini API (gemini-2.5-flash)]</div>
            <div>[Meteorology]   <span style="color: var(--emerald-400);">--Telemetry Proxy--&gt;</span> [Open-Meteo NWP & DEM API]</div>
          </div>
        </div>

      </div>
    `;
  }
};

export default TechnicalArchitectureView;
