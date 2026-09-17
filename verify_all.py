"""
TerraGuard AI - Comprehensive Verification & Location-First Proof Runner
Hits live backend and frontend services, validates determinism,
tests location-first proximity search, Mode A vs Mode B evaluation,
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
    print_header("1. Live Backend API & Location-First Endpoint Verification")
    
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

    # 4. Proximity Search: Hotspot (Wayanad)
    res = requests.get(f"{BASE_URL}/api/historical-events/nearby?lat=11.5540&lon=76.0422&radius_km=25")
    assert res.status_code == 200
    near_data = res.json()
    assert near_data["records_available"] is True
    print(f"[PASS] GET /api/historical-events/nearby (Hotspot) -> Found {near_data['events_found']} events within 25km (nearest: {near_data['nearest_event_distance_km']} km, most recent: {near_data['most_recent_event']})")

    # 5. Proximity Search: Remote / Zero History (Kopargaon)
    res = requests.get(f"{BASE_URL}/api/historical-events/nearby?lat=19.8833&lon=74.4833&radius_km=25")
    assert res.status_code == 200
    zero_data = res.json()
    assert zero_data["records_available"] is False
    assert zero_data["events_found"] == 0
    print(f"[PASS] GET /api/historical-events/nearby (Zero History) -> records_available: False, events_found: 0 (No fake events invented)")

    # 6. Geocoding
    res = requests.get(f"{BASE_URL}/api/geocode?q=Kopargaon")
    assert res.status_code == 200
    geo_data = res.json()
    assert geo_data["count"] > 0
    print(f"[PASS] GET /api/geocode?q=Kopargaon -> Resolved {geo_data['count']} matches, top: '{geo_data['results'][0]['name']}' ({geo_data['results'][0]['latitude']}°, {geo_data['results'][0]['longitude']}°)")

    # 7. Reverse Geocoding
    res = requests.get(f"{BASE_URL}/api/reverse-geocode?lat=11.5540&lon=76.0422")
    assert res.status_code == 200
    rev_data = res.json()
    print(f"[PASS] GET /api/reverse-geocode -> Resolved place: '{rev_data['name']}' ({rev_data['region']})")

    # 8. Master Location Analyze: Mode A (Historical + Current)
    res = requests.get(f"{BASE_URL}/api/location/analyze?lat=11.5540&lon=76.0422&radius_km=25")
    assert res.status_code == 200
    mode_a = res.json()
    assert mode_a["assessment_mode"] == "historical_plus_current"
    assert mode_a["historical_evidence"]["records_available"] is True
    print(f"[PASS] GET /api/location/analyze (Mode A) -> Target: '{mode_a['location']['name']}', Mode: {mode_a['assessment_mode']}, Risk Score: {mode_a['risk_score']} ({mode_a['risk_level']}), Dominant: '{mode_a['dominant_factor']}'")

    # 9. Master Location Analyze: Mode B (Current-Condition Only)
    res = requests.get(f"{BASE_URL}/api/location/analyze?lat=19.8833&lon=74.4833&radius_km=25")
    assert res.status_code == 200
    mode_b = res.json()
    assert mode_b["assessment_mode"] == "current_condition_only"
    assert mode_b["historical_evidence"]["records_available"] is False
    assert mode_b["risk_score"] > 0.0
    print(f"[PASS] GET /api/location/analyze (Mode B) -> Target: '{mode_b['location']['name']}', Mode: {mode_b['assessment_mode']}, Risk Score: {mode_b['risk_score']} ({mode_b['risk_level']}) [Evaluated without claiming zero risk]")

    # 10. Risk Map
    res = requests.get(f"{BASE_URL}/api/risk-map")
    assert res.status_code == 200
    map_data = res.json()
    print(f"[PASS] GET /api/risk-map -> {len(map_data['features'])} geospatial points configured with coordinates and risk scores.")

    # 11. Live Weather (Open-Meteo Proxy)
    res = requests.get(f"{BASE_URL}/api/live-weather?lat=11.5540&lon=76.0422")
    assert res.status_code == 200
    w_data = res.json()
    print(f"[PASS] GET /api/live-weather -> Temp: {w_data['temperature']}°C, Precip: {w_data['precipitation_mm']}mm, Condition: '{w_data['weather_condition']}' (Source: {w_data['source']})")

    # 12. Live Corridor Real-Time Hazard Monitoring
    res = requests.get(f"{BASE_URL}/api/live-corridor-monitoring")
    assert res.status_code == 200
    lcm = res.json()
    print(f"[PASS] GET /api/live-corridor-monitoring -> Successfully evaluated {lcm['monitored_corridors_count']} corridors.")

    # 13. System Status
    res = requests.get(f"{BASE_URL}/api/system-status")
    assert res.status_code == 200
    s_data = res.json()
    print(f"[PASS] GET /api/system-status -> API Latency: {s_data['api_latency_ms']}ms, Database: {s_data['database']['engine']}")

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
    print_header("3. Strict Risk Formula Determinism & Dynamic Normalization Proof")
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

    res1 = requests.post(f"{BASE_URL}/api/risk", json=payload).json()["result"]
    res2 = requests.post(f"{BASE_URL}/api/risk", json=payload).json()["result"]

    print("Comparison Results (Repeated Runs with Identical Inputs):")
    print(f"  Run 1 Final Risk Score: {res1['final_risk_score']}  |  Run 2 Final Risk Score: {res2['final_risk_score']}")
    print(f"  Run 1 Risk Class:       {res1['final_risk_class']}  |  Run 2 Risk Class:       {res2['final_risk_class']}")
    print(f"  Run 1 Raw Score:        {res1['layer1']['raw_score']}  |  Run 2 Raw Score:        {res2['layer1']['raw_score']}")
    print(f"  Run 1 Dominant Factor:  {res1['dominant_factor']} |  Run 2 Dominant Factor:  {res2['dominant_factor']}")

    assert res1['final_risk_score'] == res2['final_risk_score']
    assert res1['final_risk_class'] == res2['final_risk_class']
    assert res1['layer1']['raw_score'] == res2['layer1']['raw_score']
    assert res1['dominant_factor'] == res2['dominant_factor']
    print("\n[PASS] 100% Determinism Proof Succeeded: Identical inputs produce identical floating-point outputs.")

    # Check dynamic weight normalization in Mode B
    mb_res = requests.get(f"{BASE_URL}/api/location/analyze?lat=19.8833&lon=74.4833").json()
    active_weights_sum = sum(f["normalized_weight_pct"] for f in mb_res["factors"].values() if f["normalized"] is not None)
    print(f"\nMode B Dynamic Weight Normalization Check:")
    print(f"  Active factors count: {mb_res['data_coverage']['available_factors']} of 7")
    print(f"  Sum of normalized weights: {round(active_weights_sum, 1)}%")
    assert abs(active_weights_sum - 100.0) <= 0.5
    print(f"[PASS] Dynamic Weight Normalization Succeeded: Active factor weights sum to 100.0% without zero-substitution.")

def test_failure_injection():
    print_header("4. Failure Injection & Resilience Verification")
    res = requests.get(f"{BASE_URL}/api/live-weather?lat=999.0&lon=999.0")
    assert res.status_code == 200
    f_data = res.json()
    assert f_data["status"] == "fallback_offline"
    print(f"[PASS] Network/Coordinate Failure Simulation: API returned graceful fallback without crashing.")
    print(f"       Status: '{f_data['status']}', Source: '{f_data['source']}'")

def test_frontend_service():
    print_header("5. Frontend Service & Bundle Verification")
    try:
        res = requests.get(FRONTEND_URL, timeout=4.0)
        assert res.status_code == 200
        assert "html" in res.text.lower()
        print(f"[PASS] Frontend web server responding at {FRONTEND_URL} with HTML5 application shell.")
    except Exception as e:
        print(f"[FAIL] Frontend server connection error: {e}")
        raise

if __name__ == "__main__":
    test_backend_endpoints()
    test_validation_errors()
    test_strict_determinism()
    test_failure_injection()
    test_frontend_service()
    print("\n" + "=" * 65)
    print("  ALL LOCATION-FIRST VERIFICATION TESTS COMPLETED WITH ZERO ERRORS")
    print("=" * 65 + "\n")
