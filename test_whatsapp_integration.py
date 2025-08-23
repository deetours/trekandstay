#!/usr/bin/env python3

"""
WhatsApp Integration Test Script
Run this to validate your WhatsApp + Lead Management integration

Usage: python test_whatsapp_integration.py
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
DJANGO_BASE = "http://localhost:8000"
WHATSAPP_BASE = "http://localhost:4001"
WHATSAPP_API_KEY = "travel-bot-secret-key-2024"
DJANGO_TOKEN = "your-django-auth-token"  # Get from Django admin
TEST_PHONE = "1234567890"  # Your test phone number

def test_whatsapp_api_health():
    """Test if WhatsApp API service is running"""
    print("🔍 Testing WhatsApp API health...")
    try:
        response = requests.get(f"{WHATSAPP_BASE}/health", timeout=5)
        if response.status_code == 200:
            print("✅ WhatsApp API is running")
            return True
        else:
            print(f"❌ WhatsApp API unhealthy: {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ WhatsApp API unreachable: {e}")
        return False

def test_django_api_health():
    """Test if Django API is running"""
    print("🔍 Testing Django API health...")
    try:
        response = requests.get(f"{DJANGO_BASE}/api/leads/", timeout=5)
        if response.status_code in [200, 401]:  # 401 is ok, just means auth required
            print("✅ Django API is running")
            return True
        else:
            print(f"❌ Django API issue: {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ Django API unreachable: {e}")
        return False

def test_whatsapp_session_status():
    """Test WhatsApp session status"""
    print("🔍 Testing WhatsApp session status...")
    headers = {"X-API-Key": WHATSAPP_API_KEY}
    
    sessions = ["customer_support", "sales", "payments", "notifications"]
    all_ready = True
    
    for session_id in sessions:
        try:
            response = requests.get(
                f"{WHATSAPP_BASE}/session-status?sessionId={session_id}",
                headers=headers,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                ready = data.get('ready', False)
                
                if ready:
                    print(f"✅ Session '{session_id}': {status} (ready)")
                elif status == 'qr':
                    print(f"🔄 Session '{session_id}': QR code needed")
                    all_ready = False
                else:
                    print(f"⚠️  Session '{session_id}': {status}")
                    all_ready = False
            else:
                print(f"❌ Session '{session_id}': HTTP {response.status_code}")
                all_ready = False
                
        except requests.RequestException as e:
            print(f"❌ Session '{session_id}': {e}")
            all_ready = False
    
    return all_ready

def test_create_session():
    """Create a test session and show QR if needed"""
    print("🔍 Creating test session...")
    headers = {"X-API-Key": WHATSAPP_API_KEY}
    
    try:
        response = requests.get(
            f"{WHATSAPP_BASE}/create-session?sessionId=test",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Test session created: {data.get('status')}")
            
            if data.get('qr'):
                print("📱 QR Code available - scan with WhatsApp to connect")
                print("   (Copy QR data URL to browser to view)")
                print(f"   QR: {data['qr'][:50]}...")
            
            return True
        else:
            print(f"❌ Failed to create session: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Session creation failed: {e}")
        return False

def test_send_message():
    """Test sending a WhatsApp message"""
    print(f"🔍 Testing message send to {TEST_PHONE}...")
    headers = {
        "X-API-Key": WHATSAPP_API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "sessionId": "test",
        "to": TEST_PHONE,
        "type": "text",
        "message": f"🤖 Test message from travel booking system at {datetime.now().strftime('%H:%M:%S')}"
    }
    
    try:
        response = requests.post(
            f"{WHATSAPP_BASE}/send",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Message sent successfully: {data}")
            return True
        else:
            print(f"❌ Message send failed: {response.status_code} - {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Message send error: {e}")
        return False

def test_webhook_simulation():
    """Simulate incoming WhatsApp message webhook"""
    print("🔍 Testing webhook processing...")
    headers = {
        "X-Webhook-Token": "webhook-shared-secret-123",
        "Content-Type": "application/json"
    }
    
    payload = {
        "sessionId": "test",
        "from": f"{TEST_PHONE}@c.us",
        "to": "business@c.us", 
        "body": "Hi, I want to book a mountain trekking adventure",
        "type": "chat",
        "timestamp": int(time.time()),
        "id": f"test_msg_{int(time.time())}"
    }
    
    try:
        response = requests.post(
            f"{DJANGO_BASE}/api/whatsapp/incoming/",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Webhook processed: Lead ID {data.get('lead_id')}")
            return True
        else:
            print(f"❌ Webhook failed: {response.status_code} - {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Webhook error: {e}")
        return False

def test_django_whatsapp_send():
    """Test sending WhatsApp via Django API"""
    if not DJANGO_TOKEN or DJANGO_TOKEN == "your-django-auth-token":
        print("⚠️  Skipping Django send test - no auth token configured")
        return True
        
    print("🔍 Testing Django WhatsApp send...")
    headers = {
        "Authorization": f"Token {DJANGO_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "phone": TEST_PHONE,
        "message": f"🤖 Test from Django at {datetime.now().strftime('%H:%M:%S')}",
        "session_id": "test"
    }
    
    try:
        response = requests.post(
            f"{DJANGO_BASE}/api/whatsapp/send-message/",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Django send successful: {data}")
            return True
        else:
            print(f"❌ Django send failed: {response.status_code} - {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Django send error: {e}")
        return False

def main():
    print("🚀 WhatsApp Integration Test Suite")
    print("=" * 50)
    
    tests = [
        ("WhatsApp API Health", test_whatsapp_api_health),
        ("Django API Health", test_django_api_health),
        ("WhatsApp Sessions", test_whatsapp_session_status),
        ("Create Test Session", test_create_session),
        ("Send WhatsApp Message", test_send_message),
        ("Webhook Processing", test_webhook_simulation),
        ("Django WhatsApp Send", test_django_whatsapp_send),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
            results.append((test_name, False))
        
        time.sleep(1)  # Brief pause between tests
    
    # Summary
    print(f"\n{'='*50}")
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your WhatsApp integration is working correctly.")
    else:
        print(f"\n⚠️  {total - passed} tests failed. Check the configuration and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
