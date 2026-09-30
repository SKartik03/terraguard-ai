"""
TerraGuard AI - Deterministic Multi-Layer Risk Engine
Implements Layer 1 (Rule-based weighted formula) and Layer 2 (Trained ML inference).
Strictly deterministic: same inputs -> exact same output.
"""
import os
import logging
import joblib
import json
import numpy as np

logger = logging.getLogger("terraguard.risk_engine")

# Mapping constants
GEOLOGY_MAP = {
    "Stable": 0.0,
    "Moderate": 0.5,
    "Weak": 1.0
}

LANDCOVER_MAP = {
    "Forest": 0.1,
    "Grassland": 0.4,
    "Agriculture": 0.5,
    "Urban": 0.3,
    "Barren": 0.9
}

WINDOW_MULTIPLIERS = {
    6: 1.00,
    12: 1.03,
    24: 1.08,
    48: 1.15,
    72: 1.20
}

WEIGHTS = {
    "rainfall": 0.30,
    "slope": 0.20,
    "soil_moisture": 0.20,
    "geology": 0.15,
    "ndvi": 0.10,
    "land_cover": 0.05
}

def get_risk_class(score: float) -> str:
    if score < 40.0:
        return "LOW"
    elif score < 70.0:
        return "MODERATE"
    elif score < 85.0:
        return "HIGH"
    else:
        return "CRITICAL"

def calculate_layer1_risk(
    rainfall_mm: float,
    slope_deg: float,
    soil_moisture_pct: float,
    geology_condition: str,
    ndvi: float,
    land_cover: str,
    window_hours: int = 24
) -> dict:
    """
    Calculates deterministic Layer 1 rule-based weighted risk score.
    Returns normalized factors, weighted contributions, raw score, window multiplier, and final score.
    """
    # 1. Normalization (strictly 0.0 - 1.0)
    norm_rainfall = min(max(float(rainfall_mm), 0.0), 150.0) / 150.0
    norm_slope = min(max(float(slope_deg), 0.0), 45.0) / 45.0
    norm_soil = min(max(float(soil_moisture_pct), 0.0), 80.0) / 80.0
    norm_geology = GEOLOGY_MAP.get(geology_condition, 0.5)
    norm_ndvi = 1.0 - min(max(float(ndvi), 0.0), 1.0)  # Inverse: less vegetation -> higher risk
    norm_landcover = LANDCOVER_MAP.get(land_cover, 0.5)

    # 2. Weighted components
    contrib_rainfall = norm_rainfall * WEIGHTS["rainfall"] * 100.0
    contrib_slope = norm_slope * WEIGHTS["slope"] * 100.0
    contrib_soil = norm_soil * WEIGHTS["soil_moisture"] * 100.0
    contrib_geology = norm_geology * WEIGHTS["geology"] * 100.0
    contrib_ndvi = norm_ndvi * WEIGHTS["ndvi"] * 100.0
    contrib_landcover = norm_landcover * WEIGHTS["land_cover"] * 100.0

    raw_score = (
        contrib_rainfall +
        contrib_slope +
        contrib_soil +
        contrib_geology +
        contrib_ndvi +
        contrib_landcover
    )

    # 3. Window multiplier
    multiplier = WINDOW_MULTIPLIERS.get(int(window_hours), 1.08)
    final_score = min(round(raw_score * multiplier, 2), 100.0)
    risk_class = get_risk_class(final_score)

    factor_breakdown = {
        "rainfall": {
            "name": "Rainfall Volume",
            "raw_value": f"{rainfall_mm:.1f} mm",
            "normalized": round(norm_rainfall, 4),
            "weight_pct": 30,
            "contribution": round(contrib_rainfall * multiplier, 2),
            "hazard_level": "High" if norm_rainfall > 0.65 else ("Moderate" if norm_rainfall > 0.35 else "Low")
        },
        "slope": {
            "name": "Terrain Slope Angle",
            "raw_value": f"{slope_deg:.1f}°",
            "normalized": round(norm_slope, 4),
            "weight_pct": 20,
            "contribution": round(contrib_slope * multiplier, 2),
            "hazard_level": "High" if norm_slope > 0.65 else ("Moderate" if norm_slope > 0.35 else "Low")
        },
        "soil_moisture": {
            "name": "Soil Saturation",
            "raw_value": f"{soil_moisture_pct:.1f}%",
            "normalized": round(norm_soil, 4),
            "weight_pct": 20,
            "contribution": round(contrib_soil * multiplier, 2),
            "hazard_level": "High" if norm_soil > 0.65 else ("Moderate" if norm_soil > 0.35 else "Low")
        },
        "geology": {
            "name": "Geological Bedrock",
            "raw_value": geology_condition,
            "normalized": round(norm_geology, 4),
            "weight_pct": 15,
            "contribution": round(contrib_geology * multiplier, 2),
            "hazard_level": "High" if norm_geology > 0.65 else ("Moderate" if norm_geology > 0.35 else "Low")
        },
        "ndvi": {
            "name": "Vegetation Density (NDVI)",
            "raw_value": f"{ndvi:.2f}",
            "normalized": round(norm_ndvi, 4),
            "weight_pct": 10,
            "contribution": round(contrib_ndvi * multiplier, 2),
            "hazard_level": "High" if norm_ndvi > 0.65 else ("Moderate" if norm_ndvi > 0.35 else "Low")
        },
        "land_cover": {
            "name": "Land Cover Classification",
            "raw_value": land_cover,
            "normalized": round(norm_landcover, 4),
            "weight_pct": 5,
            "contribution": round(contrib_landcover * multiplier, 2),
            "hazard_level": "High" if norm_landcover > 0.65 else ("Moderate" if norm_landcover > 0.35 else "Low")
        }
    }

    # Find dominant factor
    dominant_key = max(factor_breakdown.keys(), key=lambda k: factor_breakdown[k]["contribution"])
    dominant_factor = factor_breakdown[dominant_key]["name"]

    return {
        "raw_score": round(raw_score, 2),
        "multiplier": multiplier,
        "final_score": final_score,
        "risk_class": risk_class,
        "dominant_factor": dominant_factor,
        "factors": factor_breakdown
    }

class MLRiskPredictor:
    """Layer 2 ML Random Forest Predictor trained on empirical historical events."""
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "model.joblib")
        self.metrics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "metrics.json")
        self.model = None
        self.metrics = None
        self.load()

    def load(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"Warning: Failed to load ML model: {e}")
                self.model = None
        if os.path.exists(self.metrics_path):
            try:
                with open(self.metrics_path, "r") as f:
                    self.metrics = json.load(f)
            except Exception as e:
                print(f"Warning: Failed to load ML metrics: {e}")
                self.metrics = None

    def predict(self, rainfall_mm: float, slope_deg: float, soil_moisture_pct: float,
                geology_condition: str, ndvi: float, land_cover: str, window_hours: int = 24) -> dict:
        if self.model is None:
            return {
                "available": False,
                "note": "ML Model artifact not found. Layer 1 Rule-Based model active."
            }

        geo_val = GEOLOGY_MAP.get(geology_condition, 0.5)
        lc_val = LANDCOVER_MAP.get(land_cover, 0.5)
        
        # Features vector matching training schema
        feature_vector = np.array([[
            float(rainfall_mm),
            float(slope_deg),
            float(soil_moisture_pct),
            geo_val,
            float(ndvi),
            lc_val,
            float(window_hours)
        ]])

        probs = self.model.predict_proba(feature_vector)[0]
        # Landslide probability (class 1)
        prob_landslide = float(probs[1]) if len(probs) > 1 else float(probs[0])
        ml_score = round(prob_landslide * 100.0, 1)
        ml_risk_class = get_risk_class(ml_score)

        importances = {}
        if hasattr(self.model, "feature_importances_"):
            feature_names = ["Rainfall", "Slope", "Soil Moisture", "Geology", "NDVI", "Land Cover", "Window Duration"]
            importances = {name: round(float(imp) * 100, 2) for name, imp in zip(feature_names, self.model.feature_importances_)}

        return {
            "available": True,
            "model_type": "RandomForestClassifier",
            "probability_pct": ml_score,
            "risk_class": ml_risk_class,
            "feature_importances": importances,
            "metrics": self.metrics
        }

# Singleton predictor
predictor = MLRiskPredictor()

def assess_risk(
    rainfall_mm: float,
    slope_deg: float,
    soil_moisture_pct: float,
    geology_condition: str,
    ndvi: float,
    land_cover: str,
    window_hours: int = 24
) -> dict:
    """Executes full dual-layer risk evaluation."""
    l1 = calculate_layer1_risk(
        rainfall_mm, slope_deg, soil_moisture_pct, geology_condition, ndvi, land_cover, window_hours
    )
    l2 = predictor.predict(
        rainfall_mm, slope_deg, soil_moisture_pct, geology_condition, ndvi, land_cover, window_hours
    )

    # Synthesized explainability text
    recs = generate_recommendations(l1["risk_class"], l1["dominant_factor"])

    return {
        "layer1": l1,
        "layer2": l2,
        "final_risk_score": l1["final_score"],
        "final_risk_class": l1["risk_class"],
        "dominant_factor": l1["dominant_factor"],
        "recommendations": recs
    }

def generate_recommendations(risk_class: str, dominant_factor: str) -> list:
    """Generates actionable risk mitigation advisories."""
    recs = []
    if risk_class == "CRITICAL":
        recs.append("Immediate Advisory: Initiate community evacuation alert for downslope settlements.")
        recs.append("Restrict access to arterial hillside roadways and critical cut-slope corridors.")
        recs.append("Deploy civil defense observation to detect surface tension cracks and ground heaving.")
    elif risk_class == "HIGH":
        recs.append("Heightened Vigilance: Pre-stage rescue personnel and activate incident command centers.")
        recs.append("Advise vulnerable valley floor residents to secure emergency evacuation kits.")
        recs.append("Inspect culverts and interceptor drainage channels for debris clogging.")
    elif risk_class == "MODERATE":
        recs.append("Advisory Watch: Monitor local automated raingauge telemetric updates every 3 hours.")
        recs.append("Survey known historical tension scarp locations for new seepage discharges.")
        recs.append("Prepare alternative logistics transport detours for mountain transit lines.")
    else:
        recs.append("Normal Status: Routine baseline monitoring. Standard drainage maintenance advised.")
        recs.append("Re-evaluate risk if 24-hour rainfall exceeds 50mm threshold.")

    # Tailored dominant factor tip
    if "Rainfall" in dominant_factor:
        recs.append(f"Precipitation Trigger: Primary risk driver is intense rainfall accumulation. Check storm radar tracks.")
    elif "Slope" in dominant_factor:
        recs.append(f"Topographical Factor: Steep slope inclination exceeds natural angle of repose.")
    elif "Soil" in dominant_factor:
        recs.append(f"Hydrological Factor: Near-saturation pore water pressure threatens slope shear strength.")

    return recs

# =====================================================================
# LOCATION-FIRST DYNAMIC RISK ENGINE (MODE A & MODE B SUPPORT)
# =====================================================================

import math

LOCATION_BASE_WEIGHTS = {
    "rainfall": 0.25,
    "slope": 0.20,
    "soil_moisture": 0.15,
    "geology": 0.15,
    "historical_evidence": 0.15,
    "ndvi": 0.05,
    "land_cover": 0.05
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates spherical distance in kilometers between two lat/lon coordinates."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def calculate_historical_evidence_score(
    events_found: int,
    nearest_distance_km: float = None,
    search_radius_km: float = 25.0,
    most_recent_year: int = None
) -> float:
    """
    Calculates normalized historical evidence index (0.0 - 1.0).
    Considers proximity to nearest past event, density within radius, and recency.
    """
    if events_found == 0 or nearest_distance_km is None:
        return 0.0

    # 1. Proximity: Closer to 0 km -> higher weight
    prox = max(0.0, 1.0 - (nearest_distance_km / max(search_radius_km, 1.0)))
    
    # 2. Event Density: 5+ historical events reaches saturation
    density = min(events_found / 5.0, 1.0)
    
    # 3. Recency factor (optional bump if recent records exist)
    recency = 0.5
    if most_recent_year:
        if most_recent_year >= 2020:
            recency = 1.0
        elif most_recent_year >= 2015:
            recency = 0.8
        else:
            recency = 0.6

    score = 0.5 * prox + 0.3 * density + 0.2 * recency
    return round(min(max(score, 0.0), 1.0), 4)

def assess_location_risk(
    factors_input: dict,
    historical_summary: dict,
    window_hours: int = 24,
    location_name: str = "Target Location",
    coordinates: tuple = None
) -> dict:
    """
    Dynamic location-first risk evaluator.
    Handles Mode A (historical + current) and Mode B (current-condition only).
    Performs dynamic weight renormalization: unavailable factors are excluded and
    remaining available weights are re-scaled to sum exactly to 100%.
    """
    has_history = historical_summary.get("records_available", False) and historical_summary.get("events_found", 0) > 0
    assessment_mode = "historical_plus_current" if has_history else "current_condition_only"

    # Evaluate each factor's availability and normalized value
    available_factors = {}
    
    # 1. Rainfall
    rf = factors_input.get("rainfall")
    if rf is not None and rf.get("value") is not None and rf.get("status") not in ["Unavailable", "Not integrated"]:
        val = float(rf["value"])
        norm = min(max(val, 0.0), 150.0) / 150.0
        available_factors["rainfall"] = {
            "name": "Rainfall Volume",
            "raw_value": f"{val:.1f} mm",
            "normalized": round(norm, 4),
            "status": rf.get("status", "Current"),
            "base_weight": LOCATION_BASE_WEIGHTS["rainfall"]
        }

    # 2. Slope
    sl = factors_input.get("slope")
    if sl is not None and sl.get("value") is not None and sl.get("status") not in ["Unavailable", "Not integrated"]:
        val = float(sl["value"])
        norm = min(max(val, 0.0), 45.0) / 45.0
        available_factors["slope"] = {
            "name": "Terrain Slope Angle",
            "raw_value": f"{val:.1f}°",
            "normalized": round(norm, 4),
            "status": sl.get("status", "Available"),
            "base_weight": LOCATION_BASE_WEIGHTS["slope"]
        }

    # 3. Soil Moisture
    sm = factors_input.get("soil_moisture")
    if sm is not None and sm.get("value") is not None and sm.get("status") not in ["Unavailable", "Not integrated"]:
        val = float(sm["value"])
        norm = min(max(val, 0.0), 80.0) / 80.0
        available_factors["soil_moisture"] = {
            "name": "Soil Saturation",
            "raw_value": f"{val:.1f}%",
            "normalized": round(norm, 4),
            "status": sm.get("status", "Available"),
            "base_weight": LOCATION_BASE_WEIGHTS["soil_moisture"]
        }

    # 4. Geology
    geo = factors_input.get("geology")
    if geo is not None and geo.get("value") is not None and geo.get("status") not in ["Unavailable", "Not integrated"]:
        val_str = str(geo["value"])
        norm = GEOLOGY_MAP.get(val_str, 0.5)
        available_factors["geology"] = {
            "name": "Geological Condition",
            "raw_value": val_str,
            "normalized": round(norm, 4),
            "status": geo.get("status", "Geographic"),
            "base_weight": LOCATION_BASE_WEIGHTS["geology"]
        }

    # 5. Historical Evidence (Mode A only)
    if has_history:
        ev_score = calculate_historical_evidence_score(
            events_found=historical_summary.get("events_found", 0),
            nearest_distance_km=historical_summary.get("nearest_event_distance_km"),
            search_radius_km=historical_summary.get("search_radius_km", 25.0),
            most_recent_year=historical_summary.get("most_recent_year")
        )
        available_factors["historical_evidence"] = {
            "name": "Historical Landslide Evidence",
            "raw_value": f"{historical_summary.get('events_found')} nearby events (nearest {historical_summary.get('nearest_event_distance_km')}km)",
            "normalized": ev_score,
            "status": "Historical",
            "base_weight": LOCATION_BASE_WEIGHTS["historical_evidence"]
        }

    # 6. NDVI
    nv = factors_input.get("ndvi")
    if nv is not None and nv.get("value") is not None and nv.get("status") not in ["Unavailable", "Not integrated"]:
        val = float(nv["value"])
        norm = 1.0 - min(max(val, 0.0), 1.0)
        available_factors["ndvi"] = {
            "name": "Vegetation Index (NDVI)",
            "raw_value": f"{val:.2f}",
            "normalized": round(norm, 4),
            "status": nv.get("status", "Prototype"),
            "base_weight": LOCATION_BASE_WEIGHTS["ndvi"]
        }

    # 7. Land Cover
    lc = factors_input.get("land_cover")
    if lc is not None and lc.get("value") is not None and lc.get("status") not in ["Unavailable", "Not integrated"]:
        val_str = str(lc["value"])
        norm = LANDCOVER_MAP.get(val_str, 0.5)
        available_factors["land_cover"] = {
            "name": "Land Cover Classification",
            "raw_value": val_str,
            "normalized": round(norm, 4),
            "status": lc.get("status", "Geographic"),
            "base_weight": LOCATION_BASE_WEIGHTS["land_cover"]
        }

    # Guard: Insufficient data check
    # Require at least 2 environmental factors
    if len(available_factors) < 2:
        return {
            "status": "INSUFFICIENT_DATA",
            "assessment_mode": assessment_mode,
            "message": "Insufficient data to generate a reliable assessment for this location.",
            "data_coverage": {
                "available_factors": len(available_factors),
                "total_factors": 7 if has_history else 6,
                "coverage_note": f"Score based on {len(available_factors)} of {7 if has_history else 6} factors"
            },
            "factors": {}
        }

    # DYNAMIC WEIGHT RENORMALIZATION RULE:
    # Scale available weights proportionally so their sum is strictly 100.0%
    total_available_weight = sum(f["base_weight"] for f in available_factors.values())
    raw_score = 0.0
    factor_breakdown = {}

    for key, f in available_factors.items():
        # Proportional redistribution: w_i' = w_i / total_available_weight
        norm_weight = f["base_weight"] / total_available_weight
        weight_pct = round(norm_weight * 100.0, 1)
        pts = f["normalized"] * norm_weight * 100.0
        raw_score += pts
        
        factor_breakdown[key] = {
            "name": f["name"],
            "raw_value": f["raw_value"],
            "status": f["status"],
            "normalized": f["normalized"],
            "normalized_weight_pct": weight_pct,
            "contribution": round(pts, 2),
            "hazard_level": "High" if f["normalized"] > 0.65 else ("Moderate" if f["normalized"] > 0.35 else "Low")
        }

    # Add unavailable factor placeholders with explicit "Data unavailable" / "Not integrated" / "None"
    all_factor_keys = ["rainfall", "slope", "soil_moisture", "geology", "historical_evidence", "ndvi", "land_cover"]
    for key in all_factor_keys:
        if key not in factor_breakdown:
            input_f = factors_input.get(key, {}) if isinstance(factors_input, dict) else {}
            custom_status = input_f.get("status") if isinstance(input_f, dict) else None
            custom_raw = input_f.get("raw_value") if isinstance(input_f, dict) else None
            
            if key == "historical_evidence":
                status_text = "None (No records found)"
                raw_text = "No historical records within search radius"
            elif custom_status in ["Not integrated", "Unavailable"]:
                status_text = custom_status
                raw_text = custom_raw or ("Not integrated (Satellite credentials required)" if key == "ndvi" else "Data unavailable")
            else:
                status_text = "Unavailable"
                raw_text = "Data unavailable"

            factor_breakdown[key] = {
                "name": LOCATION_BASE_WEIGHTS_NAMES[key],
                "raw_value": raw_text,
                "status": status_text,
                "normalized": None,
                "normalized_weight_pct": 0.0,
                "contribution": 0.0,
                "hazard_level": "Excluded"
            }

    # Window multiplier
    multiplier = WINDOW_MULTIPLIERS.get(int(window_hours), 1.08)
    final_score = min(round(raw_score * multiplier, 1), 100.0)
    risk_class = get_risk_class(final_score)

    # Dominant factor among available
    available_items = {k: v for k, v in factor_breakdown.items() if v["normalized"] is not None}
    dominant_key = max(available_items.keys(), key=lambda k: available_items[k]["contribution"]) if available_items else "slope"
    dominant_factor = factor_breakdown[dominant_key]["name"]

    # Explainable Result Text (strictly grounded in actual calculated factors)
    explanation_source = "rule_based_fallback"
    explanation = None

    # FEATURE A: Attempt Gemini-generated explainable risk narrative
    gemini_narrative = generate_gemini_reasoning(
        assessment_mode=assessment_mode,
        risk_class=risk_class,
        final_score=final_score,
        dominant_factor=dominant_factor,
        available_factors=available_factors,
        historical_summary=historical_summary,
        location_name=location_name,
        coordinates=coordinates
    )

    if gemini_narrative:
        explanation = gemini_narrative
        explanation_source = "gemini"
    else:
        explanation = generate_rule_based_reasoning(
            assessment_mode=assessment_mode,
            risk_class=risk_class,
            final_score=final_score,
            dominant_factor=dominant_factor,
            available_factors=available_factors,
            historical_summary=historical_summary
        )
        explanation_source = "rule_based_fallback"

    total_factors_evaluated = 7 if has_history else 6
    coverage_note = f"Score based on {len(available_factors)} of {total_factors_evaluated} factors"

    return {
        "status": "SUCCESS",
        "assessment_mode": assessment_mode,
        "mode_description": (
            "Historical Landslide Evidence + Current Environmental Conditions + Geographic Factors"
            if assessment_mode == "historical_plus_current" else
            "No historical landslide records were available for this location. The assessment below is based on currently available environmental and geographic indicators."
        ),
        "data_coverage": {
            "available_factors": len(available_factors),
            "total_factors": total_factors_evaluated,
            "coverage_note": coverage_note
        },
        "raw_score": round(raw_score, 2),
        "multiplier": multiplier,
        "final_risk_score": final_score,
        "final_risk_class": risk_class,
        "dominant_factor": dominant_factor,
        "factors": factor_breakdown,
        "explanation": explanation,
        "explanation_source": explanation_source,
        "safety_disclaimer": (
            "Safety Notice: TerraGuard AI is a prototype data-analysis and risk-assessment platform. "
            "Its results are not an official disaster warning or emergency notification. TerraGuard AI cannot guarantee "
            "whether a landslide will or will not occur. In an actual emergency or when official warnings are issued, "
            "follow instructions from authorized disaster-management and local authorities."
        )
    }

LOCATION_BASE_WEIGHTS_NAMES = {
    "rainfall": "Rainfall Volume",
    "slope": "Terrain Slope Angle",
    "soil_moisture": "Soil Saturation",
    "geology": "Geological Condition",
    "historical_evidence": "Historical Landslide Evidence",
    "ndvi": "Vegetation Index (NDVI)",
    "land_cover": "Land Cover Classification"
}

def call_gemini(prompt: str) -> str:
    """
    Safely executes a content generation call via Google Gemini SDK.
    Reads GEMINI_API_KEY from environment. Returns generated text or None.
    Never crashes, never hangs, strictly non-blocking fallback on any error.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key or api_key.strip() in ["", "your_gemini_api_key_here"]:
        return None

    try:
        from google import genai
        client = genai.Client(api_key=api_key.strip())
        
        # Prefer gemini-2.5-flash, fallback to gemini-1.5-flash
        models_to_try = ["gemini-2.5-flash", "gemini-1.5-flash"]
        for m in models_to_try:
            try:
                response = client.models.generate_content(
                    model=m,
                    contents=prompt
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as model_err:
                logger.warning(f"Gemini model {m} failed: {model_err}")
                continue
    except Exception as e:
        logger.warning(f"Google GenAI client initialization failed: {e}")
    return None

def generate_gemini_reasoning(
    assessment_mode: str,
    risk_class: str,
    final_score: float,
    dominant_factor: str,
    available_factors: dict,
    historical_summary: dict,
    location_name: str = "Target Location",
    coordinates: tuple = None
) -> str:
    """
    FEATURE A: Gemini-Generated Explainable Risk Narrative.
    Prompts Gemini with ONLY pre-computed deterministic & ML values.
    Gemini does NOT invent numbers; it provides a clear, plain-language narrative.
    Returns generated string, or None if Gemini is unavailable / fails.
    """
    lat_str = f"{coordinates[0]:.4f}°N" if coordinates and len(coordinates) >= 2 else "N/A"
    lon_str = f"{coordinates[1]:.4f}°E" if coordinates and len(coordinates) >= 2 else "N/A"
    mode_label = "Mode A (Historical Landslide Evidence + Current Environmental Conditions)" if assessment_mode == "historical_plus_current" else "Mode B (Current Environmental Conditions Only - No Historical Records Found)"

    factors_lines = []
    for k, v in available_factors.items():
        factors_lines.append(f"  - {v['name']}: {v['raw_value']} (Normalized hazard influence: {v['normalized']}, base weight: {round(v['base_weight']*100, 1)}%)")
    factors_summary = "\n".join(factors_lines)

    if assessment_mode == "historical_plus_current":
        history_desc = f"{historical_summary.get('events_found', 0)} recorded historical landslides within {historical_summary.get('search_radius_km', 25)} km radius (nearest recorded event: {historical_summary.get('nearest_event_distance_km', 'N/A')} km)."
    else:
        history_desc = f"No historical landslide events found within {historical_summary.get('search_radius_km', 25)} km in the catalog. Note: Absence of cataloged history does not guarantee zero risk."

    prompt = f"""You are the explainability engine for TerraGuard AI, an Indian geotechnical landslide risk assessment platform.
Explain why the following location received its computed risk assessment score to a community resident or local planner in plain, clear, non-technical language.

COMPUTED ASSESSMENT DATA (Strictly use ONLY these facts and numbers. Do NOT invent, assume, or modify any numeric values):
- Target Location: {location_name} (Coordinates: {lat_str}, {lon_str})
- Computed Final Risk Score: {final_score}/100
- Computed Risk Classification: {risk_class}
- Assessment Mode: {mode_label}
- Dominant Contributing Hazard Factor: {dominant_factor}
- Evaluated Environmental & Geographic Factors:
{factors_summary}
- Historical Evidence Status:
  {history_desc}

INSTRUCTIONS:
1. Write 3 to 5 clear, objective, plain-language sentences explaining why this specific score and risk classification were determined.
2. Explicitly reference the key contributing factors provided above (such as rainfall volume, slope angle, geological conditions, and historical records).
3. Do NOT invent any numbers, statistics, or facts not provided in the data above.
4. Adhere to cautious geotechnical language: Never state that a landslide "will definitely happen" or that an area is "100% safe". Use cautious phrasing such as "indicates elevated susceptibility", "heightened risk under heavy rainfall", or "moderate susceptibility".
5. Do NOT include greetings, preamble, markdown headings, or bullet points. Output only the explanatory paragraph.
"""
    return call_gemini(prompt)

def generate_rule_based_reasoning(
    assessment_mode: str,
    risk_class: str,
    final_score: float,
    dominant_factor: str,
    available_factors: dict,
    historical_summary: dict
) -> str:
    """Generates explainable rationale based strictly on actual calculated inputs (Rule-Based Fallback)."""
    lines = []

    rf_raw = available_factors.get("rainfall", {}).get("raw_value", "unavailable")
    sl_raw = available_factors.get("slope", {}).get("raw_value", "unavailable")

    if assessment_mode == "historical_plus_current":
        ev_count = historical_summary.get("events_found", 0)
        nearest = historical_summary.get("nearest_event_distance_km", "N/A")
        radius = historical_summary.get("search_radius_km", 25)
        lines.append(
            f"The assessment is influenced by the selected location's terrain characteristics ({sl_raw}), "
            f"current rainfall conditions ({rf_raw}), and verified historical evidence ({ev_count} documented landslide event(s) "
            f"within {radius} km, nearest recorded at {nearest} km)."
        )
    else:
        radius = historical_summary.get("search_radius_km", 25)
        lines.append(
            f"The assessment is based on currently available environmental and geographic indicators ({rf_raw} rainfall, "
            f"{sl_raw} terrain slope). No historical landslide records were found within the {radius} km search radius in the "
            f"available dataset. This does not mean the location has zero risk; conditions can still present hazards."
        )

    # Risk level cautious interpretation
    if risk_class == "CRITICAL":
        lines.append(
            f"Elevated hazard susceptibility identified (Risk Score: {final_score}/100), with {dominant_factor} "
            f"serving as the leading contributor. Conditions indicate severe geotechnical strain."
        )
    elif risk_class == "HIGH":
        lines.append(
            f"Several available indicators suggest increased landslide susceptibility at the time of assessment (Risk Score: {final_score}/100), "
            f"primarily driven by {dominant_factor}."
        )
    elif risk_class == "MODERATE":
        lines.append(
            f"Moderate susceptibility indicated by available indicators (Risk Score: {final_score}/100). "
            f"Routine precautionary monitoring of slopes and drainage is advised."
        )
    else:
        lines.append(
            f"Based on the currently available data, TerraGuard AI does not identify strong indicators of elevated landslide risk "
            f"at this time (Risk Score: {final_score}/100). However, this assessment is not 100% certain and conditions can change rapidly."
        )

    return " ".join(lines)

# Maintain backwards compatibility
generate_explainable_reasoning = generate_rule_based_reasoning

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "ml": "Malayalam (മലയാളം)",
    "bn": "Bengali (বাংলা)",
    "ta": "Tamil (தமிழ்)",
    "mr": "Marathi (मराठी)",
    "te": "Telugu (తెలుగు)",
    "kn": "Kannada (ಕನ್ನಡ)"
}

def generate_gemini_alert_dispatch(assessment_data: dict, language: str = "en") -> str:
    """
    FEATURE B: Gemini-Generated Multilingual Alert Dispatch.
    Generates a concise, civil-alert-style message in the requested language
    based strictly on the computed risk assessment for this location.
    If Gemini API is not configured or fails, returns None.
    """
    lang_code = language.lower().strip()
    target_language = LANGUAGE_NAMES.get(lang_code, "English")

    loc = assessment_data.get("location", {})
    loc_name = loc.get("name", "Target Location")
    lat = loc.get("latitude", "N/A")
    lon = loc.get("longitude", "N/A")
    risk_score = assessment_data.get("risk_score", "N/A")
    risk_level = assessment_data.get("risk_level", "MODERATE")
    dominant_factor = assessment_data.get("dominant_factor", "Environmental conditions")

    factors = assessment_data.get("factors", {})
    key_factors = []
    for k, v in factors.items():
        if isinstance(v, dict) and v.get("normalized") is not None and v.get("hazard_level") in ["High", "Moderate"]:
            key_factors.append(f"{v.get('name')}: {v.get('raw_value')}")
    key_factors_text = ", ".join(key_factors) if key_factors else "Terrain and precipitation factors"

    history = assessment_data.get("historical_evidence", {})
    if history.get("records_available"):
        history_text = f"{history.get('events_found')} nearby historical landslides on record"
    else:
        history_text = "No cataloged historical landslide records in immediate search radius"

    prompt = f"""You are the multilingual emergency communication module of TerraGuard AI, a landslide risk platform in India.
Generate a concise, civil-alert-style public safety dispatch in {target_language} based on the following computed risk assessment.

ASSESSMENT CONTEXT:
- Location: {loc_name} ({lat}°N, {lon}°E)
- Assessed Risk Level: {risk_level}
- Assessed Risk Score: {risk_score} / 100
- Leading Hazard Factor: {dominant_factor}
- Key Contributing Conditions: {key_factors_text}
- Historical Context: {history_text}

REQUIREMENTS:
1. Language: Write ENTIRELY in {target_language} (using its native regional script, e.g. Devanagari script for Hindi, Malayalam script for Malayalam, Bengali script for Bengali, Tamil script for Tamil, Marathi script for Marathi).
2. Format: Short, civil-broadcast style suitable for emergency SMS or community public address (2 to 4 sentences).
3. Tone: Serious, factual, non-alarmist, and clear.
4. Content: State the assessed risk level for {loc_name}, highlight the primary driver ({dominant_factor}), and advise standard precautionary monitoring (e.g. monitor slope drainage, exercise caution on steep slopes, follow official district alerts).
5. Disclaimer: Conclude with a brief reminder that this is an AI advisory and residents should always heed local government and SDMA/NDMA directives.
6. Output ONLY the translated message text. Do not include transliteration, English subtitles, notes, or explanations.
"""
    return call_gemini(prompt)


