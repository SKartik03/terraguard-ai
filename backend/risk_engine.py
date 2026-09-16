"""
TerraGuard AI - Deterministic Multi-Layer Risk Engine
Implements Layer 1 (Rule-based weighted formula) and Layer 2 (Trained ML inference).
Strictly deterministic: same inputs -> exact same output.
"""
import os
import joblib
import json
import numpy as np

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
