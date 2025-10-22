"""
Debug WhatsApp API Endpoints
============================

Quick test to verify endpoints are accessible and working.
"""

import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

# Now we can import after Django setup
from django.test import Client
from django.http import JsonResponse

print("\n" + "="*60)
print("🔍 Debugging WhatsApp API Endpoints")
print("="*60)

# Test if URL patterns are registered
print("\n1️⃣ Checking URL patterns...")
try:
    from django.urls import get_resolver
    resolver = get_resolver()
    
    # Look for whatsapp patterns
    for pattern in resolver.url_patterns:
        if 'whatsapp' in str(pattern.pattern):
            print(f"  ✓ Found: {pattern.pattern}")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test if app is registered
print("\n2️⃣ Checking INSTALLED_APPS...")
try:
    from django.conf import settings
    if 'whatsapp_api' in settings.INSTALLED_APPS:
        print("  ✓ whatsapp_api is registered in INSTALLED_APPS")
    else:
        print("  ✗ whatsapp_api NOT found in INSTALLED_APPS")
        print(f"  Available apps: {settings.INSTALLED_APPS}")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test if views are importable
print("\n3️⃣ Checking if views are importable...")
try:
    from whatsapp_api import views
    print(f"  ✓ whatsapp_api.views imported successfully")
    
    # List available views
    view_functions = [name for name in dir(views) if not name.startswith('_')]
    print(f"  Available functions: {view_functions}")
except Exception as e:
    print(f"  ✗ Error: {e}")
    import traceback
    traceback.print_exc()

# Test client
print("\n4️⃣ Testing endpoints with Django test client...")
client = Client()

# Test health check
print("\n  Testing GET /api/whatsapp-api/health/")
try:
    response = client.get('/api/whatsapp-api/health/')
    print(f"    Status: {response.status_code}")
    if response.status_code == 200:
        print(f"    Data: {response.json()}")
except Exception as e:
    print(f"    Error: {e}")

# Test send with CSRF exempt
print("\n  Testing POST /api/whatsapp-api/send/")
try:
    payload = {'phone_number': '919876543210', 'message_text': 'Test'}
    response = client.post(
        '/api/whatsapp-api/send/',
        data=json.dumps(payload),
        content_type='application/json'
    )
    print(f"    Status: {response.status_code}")
    if response.status_code in [200, 201]:
        print(f"    Data: {response.json()}")
    else:
        print(f"    Response: {response.content.decode()[:200]}")
except Exception as e:
    print(f"    Error: {e}")

print("\n" + "="*60)
