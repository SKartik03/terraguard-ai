"""
TerraGuard AI - Comprehensive Backend & Determinism Test Suite
Tests API endpoints, request validation, Layer 1 & Layer 2 ML outputs, and strict determinism.
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from risk_engine import calculate_layer1_risk, assess_risk

client = TestClient(app)

def test_health_endpoint():
    """Verify system health status and database connectivity."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"]["connected"] is True
    assert data["database"]["historical_records"] >= 150
    assert data["ml_engine"]["status"] == "active"

def test_locations_endpoint():
    """Verify the 6 high/moderate risk demo locations."""
    response = client.get("/api/locations")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 6
    loc_names = [l["name"] for l in data["locations"]]
    assert "Wayanad Vythiri Ghats" in loc_names
    assert "Joshimath Subsidence Ridge" in loc_names
    assert "Malin Hills Escarpment" in loc_names

def test_historical_events_endpoint():
    """Verify historical events query and filtering."""
    response = client.get("/api/historical-events?limit=20")
    assert response.status_code == 200
    data = response.json()
    assert len(data["events"]) == 20

    # Test filtering by severity
    crit_resp = client.get("/api/historical-events?severity=CRITICAL")
    assert crit_resp.status_code == 200
    crit_data = crit_resp.json()
    assert all(e["severity"] == "CRITICAL" for e in crit_data["events"])

def test_valid_risk_assessment():
    """Verify standard risk calculation with Layer 1 and Layer 2 outputs."""
    payload = {
        "location_name": "Test Hills",
        "latitude": 11.55,
        "longitude": 76.04,
        "rainfall_mm": 120.0,
        "slope_deg": 35.0,
        "soil_moisture_pct": 75.0,
        "geology_condition": "Weak",
        "ndvi": 0.3,
        "land_cover": "Barren",
        "window_hours": 24
    }
    response = client.post("/api/risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "assessment_id" in data
    res = data["result"]
    assert "layer1" in res
    assert "layer2" in res
    assert res["final_risk_score"] > 0.0
    assert res["final_risk_class"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert res["layer2"]["available"] is True
    assert 0.0 <= res["layer2"]["probability_pct"] <= 100.0

def test_invalid_risk_assessment_validation():
    """Verify Pydantic request validation on illegal inputs (422 Unprocessable Entity)."""
    # 1. Invalid geology condition
    invalid_geo_payload = {
        "rainfall_mm": 50.0,
        "slope_deg": 20.0,
        "soil_moisture_pct": 50.0,
        "geology_condition": "SuperUnstable",  # Illegal
        "ndvi": 0.5,
        "land_cover": "Forest",
        "window_hours": 24
    }
    resp = client.post("/api/risk", json=invalid_geo_payload)
    assert resp.status_code == 422

    # 2. Negative rainfall
    neg_rain_payload = {
        "rainfall_mm": -10.0,  # Illegal
        "slope_deg": 20.0,
        "soil_moisture_pct": 50.0,
        "geology_condition": "Stable",
        "ndvi": 0.5,
        "land_cover": "Forest",
        "window_hours": 24
    }
    resp2 = client.post("/api/risk", json=neg_rain_payload)
    assert resp2.status_code == 422

    # 3. Invalid window hours
    invalid_win_payload = {
        "rainfall_mm": 50.0,
        "slope_deg": 20.0,
        "soil_moisture_pct": 50.0,
        "geology_condition": "Stable",
        "ndvi": 0.5,
        "land_cover": "Forest",
        "window_hours": 99  # Illegal
    }
    resp3 = client.post("/api/risk", json=invalid_win_payload)
    assert resp3.status_code == 422

def test_strict_scoring_determinism():
    """Verify that identical inputs produce 100% identical outputs across repeated invocations."""
    payload = {
        "rainfall_mm": 95.4,
        "slope_deg": 28.7,
        "soil_moisture_pct": 68.2,
        "geology_condition": "Moderate",
        "ndvi": 0.42,
        "land_cover": "Agriculture",
        "window_hours": 48
    }

    eval1 = assess_risk(**payload)
    eval2 = assess_risk(**payload)

    # Assert exact floating point parity
    assert eval1["final_risk_score"] == eval2["final_risk_score"]
    assert eval1["final_risk_class"] == eval2["final_risk_class"]
    assert eval1["dominant_factor"] == eval2["dominant_factor"]
    assert eval1["layer1"]["raw_score"] == eval2["layer1"]["raw_score"]
    assert eval1["layer2"]["probability_pct"] == eval2["layer2"]["probability_pct"]

    # Also test through HTTP endpoint
    r1 = client.post("/api/risk", json=payload).json()["result"]
    r2 = client.post("/api/risk", json=payload).json()["result"]
    assert r1["final_risk_score"] == r2["final_risk_score"]
    assert r1["final_risk_class"] == r2["final_risk_class"]

def test_layer1_exact_formula_calculation():
    """Verify explicit formula matching the specification documentation."""
    # Test case:
    # Rainfall: 150mm -> norm=1.0 * 0.30 = 30.0
    # Slope: 45° -> norm=1.0 * 0.20 = 20.0
    # Soil: 80% -> norm=1.0 * 0.20 = 20.0
    # Geology: Weak -> norm=1.0 * 0.15 = 15.0
    # NDVI: 0.0 -> inverse norm=1.0 * 0.10 = 10.0
    # Land Cover: Barren -> norm=0.9 * 0.05 = 4.5
    # Raw sum = 30 + 20 + 20 + 15 + 10 + 4.5 = 99.5
    # Multiplier (6h): 1.0x -> Final score = 99.5
    res = calculate_layer1_risk(
        rainfall_mm=150.0,
        slope_deg=45.0,
        soil_moisture_pct=80.0,
        geology_condition="Weak",
        ndvi=0.0,
        land_cover="Barren",
        window_hours=6
    )
    assert res["raw_score"] == 99.5
    assert res["final_score"] == 99.5
    assert res["risk_class"] == "CRITICAL"

def test_risk_map_endpoint():
    """Verify GIS map endpoint provides coordinates and risk features."""
    response = client.get("/api/risk-map")
    assert response.status_code == 200
    data = response.json()
    assert len(data["features"]) == 6
    for f in data["features"]:
        assert len(f["coordinates"]) == 2
        assert "risk_score" in f
        assert "risk_class" in f

def test_live_weather_fallback():
    """Verify Open-Meteo endpoint responds with valid schema even on invalid coords or offline."""
    response = client.get("/api/live-weather?lat=11.5540&lon=76.0422")
    assert response.status_code == 200
    data = response.json()
    assert "temperature" in data
    assert "relative_humidity" in data
    assert "precipitation_mm" in data
    assert "weather_condition" in data
    assert "disclaimer" in data

def test_system_status_endpoint():
    """Verify system diagnostics endpoint."""
    response = client.get("/api/system-status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Operational"
    assert data["database"]["engine"] == "SQLite 3"
    assert data["machine_learning"]["active"] is True
