"""
TerraGuard AI - Comprehensive 7-Step Gemini Integration Live Verifier
Executes all 7 checks from the verification prompt and outputs exact JSON payloads and side-by-side comparisons.
"""
import os
import sys
import json
import time
import urllib.request
import urllib.error

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE_URL = "http://127.0.0.1:8000"

def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "TerraGuard-Verifier/1.0"})
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))

def get_json_expect_error(url):
    req = urllib.request.Request(url, headers={"User-Agent": "TerraGuard-Verifier/1.0"})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.getcode(), json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body

def run_step_1():
    print("=" * 70)
    print("STEP 1: Risk Assessment for Wayanad (lat=11.685, lon=76.132)")
    print("=" * 70)
    url = f"{BASE_URL}/api/location/analyze?lat=11.685&lon=76.132&force_refresh=true"
    code, data = get_json(url)
    print(f"HTTP Status: {code}")
    print(f"explanation_source: {data.get('explanation_source')}")
    print(f"Risk Score: {data.get('risk_score')}")
    print(f"Risk Level: {data.get('risk_level')}")
    print("\nFull JSON Response:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    print("\nExplanation Text:")
    print(data.get("explanation"))
    return data

def run_step_2(wayanad_data):
    print("\n" + "=" * 70)
    print("STEP 2: Risk Assessment for Shimla (lat=31.104, lon=77.173) & Side-by-Side Comparison")
    print("=" * 70)
    url = f"{BASE_URL}/api/location/analyze?lat=31.104&lon=77.173&force_refresh=true"
    code, shimla_data = get_json(url)
    print(f"HTTP Status: {code}")
    print(f"explanation_source: {shimla_data.get('explanation_source')}")
    print(f"Risk Score: {shimla_data.get('risk_score')}")
    print(f"Risk Level: {shimla_data.get('risk_level')}")

    print("\n--- SIDE-BY-SIDE EXPLANATION COMPARISON ---")
    print("\n[Wayanad Explanation (lat=11.685, lon=76.132)]:")
    print(wayanad_data.get("explanation"))
    print("\n[Shimla Explanation (lat=31.104, lon=77.173)]:")
    print(shimla_data.get("explanation"))
    
    diff_wording = wayanad_data.get("explanation") != shimla_data.get("explanation")
    print(f"\nGenuinely distinct text generation: {diff_wording}")
    return shimla_data

def run_step_3():
    print("\n" + "=" * 70)
    print("STEP 3: Multilingual Alert Dispatch in Hindi (language=hi)")
    print("=" * 70)
    url = f"{BASE_URL}/api/location/alert-dispatch?lat=11.685&lon=76.132&language=hi"
    code, data = get_json(url)
    print(f"HTTP Status: {code}")
    print(f"generated_by: {data.get('generated_by')}")
    print(f"language: {data.get('language')} ({data.get('language_name')})")
    print("\nFull JSON Response:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    print("\nAlert Message:")
    print(data.get("alert_message"))
    return data

def run_step_4(hindi_data):
    print("\n" + "=" * 70)
    print("STEP 4: Multilingual Alert Dispatch in Malayalam (language=ml)")
    print("=" * 70)
    url = f"{BASE_URL}/api/location/alert-dispatch?lat=11.685&lon=76.132&language=ml"
    code, ml_data = get_json(url)
    print(f"HTTP Status: {code}")
    print(f"generated_by: {ml_data.get('generated_by')}")
    print(f"language: {ml_data.get('language')} ({ml_data.get('language_name')})")
    print("\nFull JSON Response:")
    print(json.dumps(ml_data, indent=2, ensure_ascii=False))
    print("\nAlert Message (Malayalam):")
    print(ml_data.get("alert_message"))

    print("\n--- SCRIPT & CONTENT COMPARISON ---")
    print("Hindi Message:", hindi_data.get("alert_message"))
    print("Malayalam Message:", ml_data.get("alert_message"))
    distinct = hindi_data.get("alert_message") != ml_data.get("alert_message")
    print(f"Distinct regional languages: {distinct}")
    return ml_data

def run_step_5():
    print("\n" + "=" * 70)
    print("STEP 5: Fallback Behavior with Unset/Invalid GEMINI_API_KEY")
    print("=" * 70)
    url = f"{BASE_URL}/api/location/analyze?lat=11.685&lon=76.132&force_refresh=true"
    code, fallback_data = get_json(url)
    print(f"HTTP Status: {code}")
    print(f"explanation_source: {fallback_data.get('explanation_source')}")
    print(f"Risk Score: {fallback_data.get('risk_score')}")
    print("\nFallback Explanation Text:")
    print(fallback_data.get("explanation"))
    assert fallback_data.get("explanation_source") == "rule_based_fallback", "Expected rule_based_fallback"
    assert fallback_data.get("explanation"), "Explanation should not be empty"
    print("-> Verification PASSED: explanation_source equals 'rule_based_fallback', no crash or blank response.")
    return fallback_data

def run_step_6():
    print("\n" + "=" * 70)
    print("STEP 6: Alert Dispatch with Invalid Key -> Expect HTTP 503")
    print("=" * 70)
    url_alert = f"{BASE_URL}/api/location/alert-dispatch?lat=11.685&lon=76.132&language=hi"
    code_alert, err_data = get_json_expect_error(url_alert)
    print(f"HTTP Status: {code_alert} (Expected: 503)")
    print("Response Body:")
    print(json.dumps(err_data, indent=2, ensure_ascii=False) if isinstance(err_data, dict) else err_data)
    assert code_alert == 503, f"Expected 503 but got {code_alert}"
    print("-> Verification PASSED: Returned HTTP 503 without fake/templated alert message.")
    return err_data

def run_step_7():
    print("\n" + "=" * 70)
    print("STEP 7: Restore Valid GEMINI_API_KEY and Re-verify Step 1")
    print("=" * 70)
    url = f"{BASE_URL}/api/location/analyze?lat=11.685&lon=76.132&force_refresh=true"
    code, data = get_json(url)
    print(f"HTTP Status: {code}")
    print(f"explanation_source: {data.get('explanation_source')}")
    print(f"Risk Score: {data.get('risk_score')}")
    print("\nRestored Live Explanation Text:")
    print(data.get("explanation"))
    assert data.get("explanation_source") == "gemini", "Expected gemini after key restoration"
    print("-> Verification PASSED: Live Gemini successfully restored.")
    return data

if __name__ == "__main__":
    from risk_engine import load_env_file
    load_env_file()
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    if len(sys.argv) > 1 and sys.argv[1] == "fallback_only":
        run_step_5()
        run_step_6()
    elif not key or key == "your_gemini_api_key_here":
        print("GEMINI_API_KEY is currently NOT set.")
        print("Running Step 5 & 6 (Fallback Verification)...")
        run_step_5()
        run_step_6()
    else:
        print("Valid GEMINI_API_KEY detected! Executing complete 7-step verification...")
        
        # Step 1
        wayanad = run_step_1()
        
        # Step 2
        shimla = run_step_2(wayanad)
        
        # Step 3
        hindi = run_step_3()
        
        # Step 4
        ml = run_step_4(hindi)

        # Prepare for Step 5 & 6 by temporarily pointing .env to invalid key
        env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
        bak_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.bak")
        
        saved_key = key
        try:
            if os.path.exists(env_path):
                with open(env_path, "r", encoding="utf-8") as f:
                    orig_content = f.read()
                with open(bak_path, "w", encoding="utf-8") as f:
                    f.write(orig_content)
            
            # Write invalid key
            with open(env_path, "w", encoding="utf-8") as f:
                f.write("GEMINI_API_KEY=invalid_key_for_testing_purposes\n")
            
            # Step 5 & 6
            run_step_5()
            run_step_6()
            
        finally:
            # Restore valid key for Step 7
            if os.path.exists(bak_path):
                with open(bak_path, "r", encoding="utf-8") as f:
                    restored_content = f.read()
                with open(env_path, "w", encoding="utf-8") as f:
                    f.write(restored_content)
                os.remove(bak_path)
            else:
                with open(env_path, "w", encoding="utf-8") as f:
                    f.write(f"GEMINI_API_KEY={saved_key}\n")
            
            # Step 7
            run_step_7()
