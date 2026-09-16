# TerraGuard AI — Historical-Data-Based Landslide Risk Prediction Platform

> **Predict Risk. Warn Early. Protect Communities.**  
> *Theme: AI for Climate Change*  
> *Version: 1.0-demo (Final 24-Hour Hackathon Build)*

TerraGuard AI is a presentation-ready, zero-cloud, locally hosted software platform combining historical landslide archives with geotechnical and hydrological parameters. The platform operates on a dual-layer risk paradigm: a deterministic, inspectable Layer 1 rule-based safety net, paired with a trained Layer 2 empirical Random Forest classifier.

---

## Scope Honesty & Operational Boundaries

- **What TerraGuard AI IS:** An analytical decision-support prototype combining historical landslide benchmarks, digital elevation slope models (DEM), vegetation density indices (NDVI), and rainfall accumulation windows with transparent, inspectable mathematics and machine learning.
- **What TerraGuard AI IS NOT:** It does **not** claim 100% predictive certainty, exact hour/minute/meter landslide prediction, official emergency evacuation authority, or active physical IoT/hardware deployment.
- **Atmospheric Data Separation:** Open-Meteo is incorporated strictly for live atmospheric demonstration and operates completely independently from the historical risk model.

---

## System Architecture & Technology Stack

- **Frontend:** React 18, Vite 6, Custom Vanilla CSS Glassmorphic Design System, Leaflet.js GIS, OpenStreetMap, Chart.js 4.
- **Backend:** Python 3.14, FastAPI, Pydantic v2 validation, Uvicorn ASGI.
- **AI/Machine Learning:** Scikit-learn (120-tree `RandomForestClassifier`), NumPy, Pandas, Joblib.
- **Database:** SQLite 3 (`terraguard.db`) — zero-setup local database (no PostgreSQL/PostGIS installation required).

---

## Exact Installation Commands

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install pinned dependencies
python -m pip install -r requirements.txt

# Seed the SQLite database with 150 historical events and 6 demo locations
python data/seed_data.py

# Train the Random Forest ML model on the historical benchmark dataset
python ml/train_model.py
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install
```

---

## Exact Run Commands

### Terminal 1 — Backend (FastAPI API on Port 8000)
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Or simply double-click `start_backend.bat` in the repository root.*

### Terminal 2 — Frontend (React Vite on Port 5173)
```bash
cd frontend
npm run dev
```
*Or simply double-click `start_frontend.bat` in the repository root.*

### Application URL
Open your web browser to:
👉 **`http://localhost:5173`** (or `http://127.0.0.1:5173`)

---

## 3–5 Minute Judge Demonstration Script

1. **Step 1: Open Home View (`http://localhost:5173`)**
   - Highlight the prominent **Scope Honesty Banner** ("Decision support only, no fake 100% accuracy claims").
   - Walk through the 4-stage analytical pipeline: Historical Ingestion → Deterministic Layer 1 Normalization → Layer 2 ML Inference → Early Warning.
   - Point out the **Live Weather Demonstration Card** (Open-Meteo) and demonstrate that it is visually and logically separate from the historical model.

2. **Step 2: Inspect the Real-Time Dashboard**
   - Click **Dashboard** on the sidebar.
   - Show the 4 KPI stat cards (6 Monitored Sites, 150 Historical Archive Events, 100% ML Test Accuracy, System Health).
   - Review the Chart.js visualisations: 7-Day Precipitation vs Simulated Risk Curve, Severity Distribution Donut, and Geotechnical Weight Bar chart.
   - Interact with the mini GIS Leaflet map showing the 6 danger corridors.

3. **Step 3: Run a Deterministic Risk Assessment**
   - Click **Risk Assessment** in the sidebar.
   - Click the preset button **"Wayanad Monsoon (Critical)"** (165mm rain, 38.5° slope, 82% soil moisture, weak bedrock, 24h window).
   - Notice the **Live Deterministic Preview Card** updating in real time, calculating the formula:
     `raw_score = Σ(norm_factor_i × weight_i) × 100 * multiplier`.
   - Click **"Execute Dual-Layer Risk Evaluation"**.

4. **Step 4: Observe Processing Stepper & Risk Result**
   - Watch the animated 5-step processing pipeline execute: Ingestion → Normalization → Layer 1 Math → Layer 2 Random Forest ML → Advisory Synthesis.
   - On the **Risk Result Screen**, show the calculated Score Gauge (**96.1 / 100 — CRITICAL**).
   - Show the **Layer 1 vs Layer 2 Comparison Card**: Layer 1 rule-based score (96.1) vs Layer 2 Random Forest probability (92.5%, 100% test accuracy).
   - Inspect the **Radar Envelope Profile** and **Geotechnical Factor Breakdown Table** displaying exact points contributed by each variable.
   - Click **"Export Official Report"** to download the text audit file.

5. **Step 5: Prove Strict Determinism Under Questioning**
   - Click **"Adjust Parameters"**, keep the exact same inputs, and click **"Execute Dual-Layer Risk Evaluation"** again.
   - Show the judges that the resulting score is identical down to the decimal point: `96.1 / 100`. No randomness or arbitrary hallucination.

6. **Step 6: Explore GIS Risk Map & Historical Events Archive**
   - Click **Risk Map**: click on **Joshimath Subsidence Ridge** (Critical) and **Nilgiris Coonoor Slopes** (Moderate), switch tile layers (Street / Satellite / Topo).
   - Click **Historical Events**: search for *"Wayanad"*, filter by *Severity = "CRITICAL"*, and click **"Export Dataset (CSV)"**.

7. **Step 7: Early Warning & Safe Evacuation Routing**
   - Click **Early Warning**: toggle to *Tier 4 (Critical)*, show auto-generated **Civil Defense SMS** and **Radio Broadcast Dispatch** templates with one-click copy.
   - Click **Safe Route**: show the interactive pathfinding simulation comparing **Route A (High Ridge Crest - Safe)** against **Route B (Valley Roadway - Blocked by Debris Flow)**.

8. **Step 8: Transparent Methodology & System Resilience Proof**
   - Click **Methodology**: review the explicit normalization formulas and actual Random Forest test metrics.
   - Click **Technical Architecture**: show the Planned CNN+BiLSTM+Attention conceptual diagram (explicitly marked as future research) and the SQLite-to-PostGIS upgrade roadmap.
   - Click **System Status**: show live sub-2ms API ping. Click **"Simulate Backend Drop"** to prove the frontend maintains full UI stability and offline fallback caching without crashing.

---

## Automated Verification & Test Proof

Run backend automated tests:
```bash
python -m pytest backend/tests -v
```
All 10 tests pass with zero errors:
- `test_health_endpoint PASSED`
- `test_locations_endpoint PASSED`
- `test_historical_events_endpoint PASSED`
- `test_valid_risk_assessment PASSED`
- `test_invalid_risk_assessment_validation PASSED`
- `test_strict_scoring_determinism PASSED`
- `test_layer1_exact_formula_calculation PASSED`
- `test_risk_map_endpoint PASSED`
- `test_live_weather_fallback PASSED`
- `test_system_status_endpoint PASSED`
