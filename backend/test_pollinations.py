"""
Test file to debug Pollinations API and Context Analyzer pipeline.
Mimics the actual flow to identify issues with 530 errors.
"""
import requests
import json
import time

# Pollinations API configuration (from config.py)
POLLINATIONS_API_KEY = "sk_ByH8auEaV7hs80DqgmeoJoHw2g4Wqcc7"
POLLINATIONS_ENDPOINT = "https://gen.pollinations.ai/v1/chat/completions"
MODEL = "mistral"  # Changed from "mistral"

def test_pollinations_raw():
    """Test raw Pollinations API call to see exact response."""
    print("\n" + "="*60)
    print("TEST 1: Raw Pollinations API Call")
    print("="*60)
    
    payload = {
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful AI assistant. Respond with valid JSON only."
            },
            {
                "role": "user",
                "content": "Generate a simple JSON object with two fields: 'status' and 'message'. Set status to 'ok' and message to 'test successful'."
            }
        ],
        "model": MODEL,
        "jsonMode": True,
        "seed": 42
    }
    
    headers = {
        "Authorization": f"Bearer {POLLINATIONS_API_KEY}",
        "Content-Type": "application/json"
    }
    
    print(f"\nEndpoint: {POLLINATIONS_ENDPOINT}")
    print(f"Payload: {json.dumps(payload, indent=2)[:300]}")
    
    try:
        print("\nSending request...")
        response = requests.post(
            POLLINATIONS_ENDPOINT,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"\nResponse Body (first 1000 chars):\n{response.text[:1000]}")
        
        if response.status_code == 200:
            print("\n✅ SUCCESS: API returned 200")
            try:
                data = response.json()
                print(f"Parsed JSON: {json.dumps(data, indent=2)}")
            except json.JSONDecodeError as e:
                print(f"❌ JSON Parse Error: {e}")
        elif response.status_code == 530:
            print(f"\n❌ CLOUDFLARE TUNNEL ERROR (530)")
            print("This indicates Pollinations infrastructure is down.")
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")


def test_pollinations_with_retry():
    """Test with retry logic from gemini_service.py."""
    print("\n" + "="*60)
    print("TEST 2: Pollinations API with Retry Logic")
    print("="*60)
    
    max_attempts = 3
    retry_delays = [2, 4, 8]
    
    payload = {
        "messages": [{"role": "user", "content": "Return JSON: {\"test\": \"success\"}"}],
        "model": MODEL,
        "jsonMode": True
    }
    
    headers = {
        "Authorization": f"Bearer {POLLINATIONS_API_KEY}",
        "Content-Type": "application/json"
    }
    
    for attempt in range(max_attempts):
        try:
            print(f"\nAttempt {attempt + 1}/{max_attempts}...")
            response = requests.post(POLLINATIONS_ENDPOINT, headers=headers, json=payload, timeout=30)
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ SUCCESS!")
                return response.json()
            elif response.status_code in [530, 503, 502, 504]:
                if attempt < max_attempts - 1:
                    delay = retry_delays[attempt]
                    print(f"⚠️  Error {response.status_code}, retrying in {delay}s...")
                    time.sleep(delay)
                    
        except Exception as e:
            print(f"❌ Exception: {e}")


def test_alternative_endpoints():
    """Test alternative Pollinations endpoints."""
    print("\n" + "="*60)
    print("TEST 3: Alternative Endpoints")
    print("="*60)
    
    endpoints = [
        "https://text.pollinations.ai/",
        "https://api.pollinations.ai/text",
    ]
    
    for endpoint in endpoints:
        print(f"\nTrying: {endpoint}")
        try:
            response = requests.post(
                endpoint,
                headers={"Authorization": f"Bearer {POLLINATIONS_API_KEY}", "Content-Type": "application/json"},
                json={"messages": [{"role": "user", "content": "test"}], "model": MODEL},
                timeout=10
            )
            print(f"Status: {response.status_code} - {response.text[:100]}")
        except Exception as e:
            print(f"Error: {str(e)[:100]}")


if __name__ == "__main__":
    print("POLLINATIONS API DEBUGGING SUITE")
    print(f"API Key: {POLLINATIONS_API_KEY[:20]}...")
    
    test_pollinations_raw()
    test_pollinations_with_retry()
    test_alternative_endpoints()
    
    print("\n" + "="*60)
    print("If all return 530: Service is down, consider fallback")
    print("="*60)