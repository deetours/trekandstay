#!/usr/bin/env python
"""
API Test Script - Tests if Django server is responding
"""
import requests
import time
import sys

def test_api_endpoint(url, description):
    """Test a specific API endpoint"""
    try:
        response = requests.get(url, timeout=5)
        print(f"✅ {description}: {response.status_code}")
        if response.status_code == 200:
            return True
        else:
            print(f"   Response: {response.text[:100]}...")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ {description}: CONNECTION REFUSED")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {description}: TIMEOUT")
        return False
    except Exception as e:
        print(f"❌ {description}: ERROR - {e}")
        return False

def main():
    print("🌐 Testing Django API Endpoints...")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:8000"
    
    endpoints = [
        (f"{base_url}/api/", "Core API Root"),
        (f"{base_url}/admin/", "Django Admin"),
        (f"{base_url}/api/auth/me/", "Auth Me Endpoint"),
        (f"{base_url}/api/trips/", "Trips API"),
        (f"{base_url}/api/dashboard/summary/", "Dashboard Summary")
    ]
    
    print("Waiting for server to start...")
    time.sleep(3)
    
    passed = 0
    total = len(endpoints)
    
    for url, description in endpoints:
        if test_api_endpoint(url, description):
            passed += 1
        print()
    
    print("=" * 50)
    print(f"🎯 API Test Results: {passed}/{total} endpoints responding")
    
    if passed >= 1:  # At least one endpoint working
        print("🎉 Django server is responding!")
        return True
    else:
        print("⚠️  Django server appears to be down")
        return False

if __name__ == "__main__":
    if main():
        sys.exit(0)
    else:
        sys.exit(1)