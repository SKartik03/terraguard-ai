"""
TerraGuard AI - Comprehensive Verification & Proof Runner
Hits live backend and frontend services, validates determinism,
tests failure injection, and produces verifiable terminal evidence.
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5173"

def print_header(title):
    print("\n" + "=" * 65)
    print(f"  {title.upper()}")
    print("=" * 65)

def test_backend_endpoints():
    print_header("1. Live Backend API Endpoint Verification")
    
    # 1. Health
    res = requests.get(f"{BASE_URL}/api/health")
    assert res.status_code == 200
    h_data = res.json()
    print(f"[PASS] GET /api/health -> Status: {h_data['status']}, Database: {h_data['database']['type']}, Records: {h_data['database']['historical_records']}")

    # 2. Locations
    res = requests.get(f"{BASE_URL}/api/locations")
    assert res.status_code == 200
    loc_data = res.json()
    print(f"[PASS] GET /api/locations -> Retrieved {loc_data['count']} demonstration locations: {[l['name'] for l in loc_data['locations'][:3]]}...")

    # 3. Historical Events
    res = requests.get(f"{BASE_URL}/api/historical-events?limit=5&severity=CRITICAL")
    assert res.status_code == 200
    ev_data = res.json()
    print(f"[PASS] GET /api/historical-events -> Filtered {len(ev_data['events'])} critical events, first: {ev_data['events'][0]['location_name']} ({ev_data['events'][0]['rainfall_mm']}mm)")

    # 4. Risk Map
    res = requests.get(f"{BASE_URL}/api/risk-map")
    assert res.status_code == 200
    map_data = res.json()
    print(f"[PASS] GET /api/risk-map -> {len(map_data['features'])} geospatial points configured with coordinates and risk scores.")

    # 5. Live Weather (Open-Meteo Proxy)
    res = requests.get(f"{BASE_URL}/api/live-weather?lat=11.5540&lon=76.0422")
    assert res.status_code == 200
    w_data = res.json()
    print(f"[PASS] GET /api/live-weather -> Temp: {w_data['temperature']}°C, Precip: {w_data['precipitation_mm']}mm, Condition: '{w_data['weather_condition']}' (Source: {w_data['source']})")

    # 6. System Status
    res = requests.get(f"{BASE_URL}/api/system-status")
    assert res.status_code == 200
    s_data = res.json()
    print(f"[PASS] GET /api/system-status -> API Latency: {s_data['api_latency_ms']}ms, ML Engine: {s_data['machine_learning']['engine']}, Accuracy: {s_data['machine_learning']['accuracy']}")

def test_validation_errors():
    print_header("2. Input Validation & Error Handling Verification (Invalid Inputs)")

    # Invalid geology condition
    inv1 = {
        "rainfall_mm": 50.0, "slope_deg": 25.0, "soil_moisture_pct": 60.0,
        "geology_condition": "InvalidLithology", "ndvi": 0.5, "land_cover": "Forest", "window_hours": 24
    }
    r1 = requests.post(f"{BASE_URL}/api/risk", json=inv1)
    assert r1.status_code == 422
    print(f"[PASS] POST /api/risk (Invalid geology_condition='InvalidLithology') -> Correctly returned HTTP {r1.status_code} Unprocessable Entity.")

    # Negative rainfall
    inv2 = {
        "rainfall_mm": -25.0, "slope_deg": 25.0, "soil_moisture_pct": 60.0,
        "geology_condition": "Stable", "ndvi": 0.5, "land_cover": "Forest", "window_hours": 24
    }
    r2 = requests.post(f"{BASE_URL}/api/risk", json=inv2)
    assert r2.status_code == 422
    print(f"[PASS] POST /api/risk (Negative rainfall_mm=-25.0) -> Correctly returned HTTP {r2.status_code} Unprocessable Entity.")

    # Illegal window hours
    inv3 = {
        "rainfall_mm": 50.0, "slope_deg": 25.0, "soil_moisture_pct": 60.0,
        "geology_condition": "Stable", "ndvi": 0.5, "land_cover": "Forest", "window_hours": 100
    }
    r3 = requests.post(f"{BASE_URL}/api/risk", json=inv3)
    assert r3.status_code == 422
    print(f"[PASS] POST /api/risk (Illegal window_hours=100) -> Correctly returned HTTP {r3.status_code} Unprocessable Entity.")

def test_strict_determinism():
    print_header("3. Strict Risk Formula Determinism Proof")
    payload = {
        "location_name": "Determinism Test Site",
        "latitude": 11.5540,
        "longitude": 76.0422,
        "rainfall_mm": 138.4,
        "slope_deg": 37.2,
        "soil_moisture_pct": 74.8,
        "geology_condition": "Weak",
        "ndvi": 0.31,
        "land_cover": "Barren",
        "window_hours": 48
    }

    print(f"Submitting Run 1 with inputs:\n  Rainfall: {payload['rainfall_mm']}mm, Slope: {payload['slope_deg']}°, Soil Moisture: {payload['soil_moisture_pct']}%, Geology: {payload['geology_condition']}, NDVI: {payload['ndvi']}, Land Cover: {payload['land_cover']}, Window: {payload['window_hours']}h")
    res1 = requests.post(f"{BASE_URL}/api/risk", json=payload).json()["result"]
    
    print(f"Submitting Run 2 with identical inputs...")
    res2 = requests.post(f"{BASE_URL}/api/risk", json=payload).json()["result"]

    print("\nComparison Results:")
    print(f"  Run 1 Final Risk Score: {res1['final_risk_score']}  |  Run 2 Final Risk Score: {res2['final_risk_score']}")
    print(f"  Run 1 Risk Class:       {res1['final_risk_class']}  |  Run 2 Risk Class:       {res2['final_risk_class']}")
    print(f"  Run 1 Raw Score:        {res1['layer1']['raw_score']}  |  Run 2 Raw Score:        {res2['layer1']['raw_score']}")
    print(f"  Run 1 Window Mult:      {res1['layer1']['multiplier']}x |  Run 2 Window Mult:      {res2['layer1']['multiplier']}x")
    print(f"  Run 1 ML Probability:   {res1['layer2']['probability_pct']}% |  Run 2 ML Probability:   {res2['layer2']['probability_pct']}%")
    print(f"  Run 1 Dominant Factor:  {res1['dominant_factor']} |  Run 2 Dominant Factor:  {res2['dominant_factor']}")

    assert res1['final_risk_score'] == res2['final_risk_score']
    assert res1['final_risk_class'] == res2['final_risk_class']
    assert res1['layer1']['raw_score'] == res2['layer1']['raw_score']
    assert res1['layer2']['probability_pct'] == res2['layer2']['probability_pct']
    assert res1['dominant_factor'] == res2['dominant_factor']
    print("\n[PASS] 100% Determinism Proof Succeeded: Identical inputs produce identical floating-point outputs.")

def test_failure_injection():
    print_header("4. Failure Injection & Resilience Verification")

    # Test live weather fallback with an unreachable lat/lon or offline simulation
    res = requests.get(f"{BASE_URL}/api/live-weather?lat=999.0&lon=999.0")
    assert res.status_code == 200
    w_data = res.json()
    assert "temperature" in w_data
    assert "precipitation_mm" in w_data
    print(f"[PASS] Network/Coordinate Failure Simulation: API returned graceful fallback without crashing.")
    print(f"       Status: '{w_data.get('status')}', Source: '{w_data.get('source')}'")

def test_frontend_availability():
    print_header("5. Frontend Service & Bundle Verification")
    res = requests.get(FRONTEND_URL)
    assert res.status_code == 200
    assert "<!DOCTYPE html>" in res.text
    assert "TerraGuard AI" in res.text
    print(f"[PASS] Frontend web server responding at {FRONTEND_URL} with HTML5 application shell.")

if __name__ == "__main__":
    test_backend_endpoints()
    test_validation_errors()
    test_strict_determinism()
    test_failure_injection()
    test_frontend_availability()
    print("\n" + "=" * 65)
    print("  ALL VERIFICATION TESTS COMPLETED WITH ZERO ERRORS")
    print("=" * 65 + "\n")
