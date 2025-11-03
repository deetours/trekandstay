#!/usr/bin/env python
"""
Test script for Trip Recommendation Engine API
"""
import requests
import json

def test_recommendation_api():
    """Test the trip recommendation API endpoints"""

    base_url = "http://localhost:8000/api"

    print("🧪 Testing Trip Recommendation Engine API")
    print("=" * 50)

    # Test 1: Get recommendations for current user (requires auth)
    print("\n1. Testing recommendation stats (no auth required)...")
    try:
        response = requests.get(f"{base_url}/recommendations/stats/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stats retrieved: {data}")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

    # Test 2: Test recommendation retraining (requires auth)
    print("\n2. Testing recommendation retraining...")
    try:
        # This would require authentication token
        response = requests.post(f"{base_url}/recommendations/retrain/")
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("✅ Auth required (expected)")
        elif response.status_code == 200:
            print("✅ Retraining successful")
        else:
            print(f"❌ Unexpected response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

    print("\n🎯 API testing complete!")

if __name__ == "__main__":
    test_recommendation_api()