"""
TerraGuard AI - Credential Rotation & Dual-Environment Verifier
Masks all secrets and tests both local and deployed backends.
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

LOCAL_BASE = "http://127.0.0.1:8000"
RENDER_BASE = "https://terraguard-ai-ew30.onrender.com"
OLD_KEY_PREFIX = "AQ.Ab8RN6J2tN"

def mask_key(k):
    if not k or len(k) < 8:
        return "[NOT SET]"
    return f"{k[:4]}...{k[-4:]} (length {len(k)})"

def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "TerraGuard-RotationVerifier/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))

def get_json_safe(url):
    try:
        return get_json(url)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body
    except Exception as e:
        return 0, str(e)

def check_old_key_revoked(old_key_sample):
    print("Checking old key revocation status with Google GenAI API...")
    try:
        from google import genai
        client = genai.Client(api_key=old_key_sample)
        res = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents="ping"
        )
        print("-> ALERT: Old key is STILL ACTIVE and accepts requests. Please delete it in Google AI Studio.")
        return False
    except Exception as e:
        err_msg = str(e)
        if "API_KEY_INVALID" in err_msg or "400" in err_msg or "INVALID_ARGUMENT" in err_msg or "PERMISSION_DENIED" in err_msg:
            print(f"-> CONFIRMED REVOKED: Google API rejected the old key ({type(e).__name__}).")
            return True
        else:
            print(f"-> Old key call returned error: {err_msg[:120]}")
            return True

if __name__ == "__main__":
    from risk_engine import load_env_file
    load_env_file()
    current_key = os.environ.get("GEMINI_API_KEY", "")

    print("=" * 70)
    print("TERRAGUARD AI - CREDENTIAL ROTATION AUDIT")
    print("=" * 70)
    print(f"Current key in backend/.env: {mask_key(current_key)}")

    is_old = current_key.startswith(OLD_KEY_PREFIX)
    if is_old:
        print("\n[!] backend/.env currently still contains the OLD key.")
        check_old_key_revoked(current_key)
        print("\nNext step: Please generate a new key in Google AI Studio, paste it into backend/.env, and delete the old key.")
    else:
        print("\n[✓] New key detected in backend/.env (different from old key).")
        # Check if local backend is running
        print("\n--- CHECKING LOCAL BACKEND (http://127.0.0.1:8000) ---")
        code, data = get_json_safe(f"{LOCAL_BASE}/api/location/analyze?lat=11.685&lon=76.132&force_refresh=true")
        print(f"HTTP Status: {code}")
        print(f"explanation_source: {data.get('explanation_source') if isinstance(data, dict) else 'N/A'}")
        if isinstance(data, dict):
            print(f"Local Explanation Snippet: {data.get('explanation', '')[:180]}...")

        code_alert, data_alert = get_json_safe(f"{LOCAL_BASE}/api/location/alert-dispatch?lat=11.685&lon=76.132&language=hi")
        print(f"Alert HTTP Status: {code_alert}")
        print(f"generated_by: {data_alert.get('generated_by') if isinstance(data_alert, dict) else 'N/A'}")
        if isinstance(data_alert, dict) and "alert_message" in data_alert:
            print(f"Local Hindi Alert: {data_alert.get('alert_message')}")

        print("\n--- CHECKING DEPLOYED RENDER BACKEND (https://terraguard-ai-ew30.onrender.com) ---")
        code_r, data_r = get_json_safe(f"{RENDER_BASE}/api/location/analyze?lat=11.685&lon=76.132&force_refresh=true")
        print(f"Render HTTP Status: {code_r}")
        print(f"explanation_source: {data_r.get('explanation_source') if isinstance(data_r, dict) else 'N/A'}")
        if isinstance(data_r, dict):
            print(f"Render Explanation Snippet: {data_r.get('explanation', '')[:180]}...")

        code_ra, data_ra = get_json_safe(f"{RENDER_BASE}/api/location/alert-dispatch?lat=11.685&lon=76.132&language=hi")
        print(f"Render Alert HTTP Status: {code_ra}")
        print(f"generated_by: {data_ra.get('generated_by') if isinstance(data_ra, dict) else 'N/A'}")
        if isinstance(data_ra, dict) and "alert_message" in data_ra:
            print(f"Render Hindi Alert: {data_ra.get('alert_message')}")
