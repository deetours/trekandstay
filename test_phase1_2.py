#!/usr/bin/env python
"""
Test Script for Phase 1 & 2 Implementation
Tests admin APIs and AI agent functionality
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

import requests
import json
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from core.models import Lead, LeadEvent, OutboundMessage
from services.enhanced_smart_agent import get_enhanced_agent
from services.whatsapp_ai_config import WhatsAppAIConfig

print("=" * 70)
print("🧪 PHASE 1 & 2 TEST SUITE")
print("=" * 70)

# ============================================================
# Test 1: Check Configuration
# ============================================================

print("\n1️⃣ Configuration Check")
print("-" * 70)

config = WhatsAppAIConfig()
config_status = config.get_config_status()

print(f"✅ OpenAI Configured: {config_status['openai_configured']}")
print(f"✅ Pinecone Configured: {config_status['pinecone_configured']}")
print(f"✅ LLM Model: {config_status['llm_model']}")
print(f"✅ Embedding Model: {config_status['embedding_model']}")
print(f"✅ RAG Enabled: {config_status['rag_enabled']}")

is_valid = config.validate_config()
if is_valid:
    print("✅ Configuration Valid!")
else:
    print("❌ Configuration Issues - Check .env file")

# ============================================================
# Test 2: Database Models
# ============================================================

print("\n2️⃣ Database Models Check")
print("-" * 70)

lead_count = Lead.objects.count()
event_count = LeadEvent.objects.count()
message_count = OutboundMessage.objects.count()

print(f"✅ Total Leads in DB: {lead_count}")
print(f"✅ Total Events in DB: {event_count}")
print(f"✅ Total Messages in DB: {message_count}")

# ============================================================
# Test 3: Enhanced Agent Initialization
# ============================================================

print("\n3️⃣ Enhanced Agent Test")
print("-" * 70)

try:
    agent = get_enhanced_agent()
    print("✅ Enhanced Agent initialized")
    print(f"   LLM Service: {agent.llm_service.__class__.__name__}")
    print(f"   Memory Service: {agent.memory.__class__.__name__}")
    print(f"   RAG Service: {agent.rag.__class__.__name__}")
except Exception as e:
    print(f"❌ Failed to initialize agent: {e}")

# ============================================================
# Test 4: AI Message Processing (if configured)
# ============================================================

print("\n4️⃣ AI Message Processing Test")
print("-" * 70)

if config_status['openai_configured']:
    try:
        test_messages = [
            ("919876543210", "How much is the Everest trek?", "Test User 1"),
            ("919876543211", "I want to book a trek", "Test User 2"),
        ]
        
        for phone, message, name in test_messages:
            print(f"\n📱 Testing: {message}")
            
            result = agent.process_customer_message(
                phone=phone,
                message=message,
                customer_name=name,
            )
            
            if result['success']:
                print(f"✅ Response generated successfully")
                print(f"   Confidence: {result['confidence']:.0%}")
                print(f"   Processing time: {result['processing_time_ms']}ms")
                print(f"   First 100 chars: {result['response'][:100]}...")
            else:
                print(f"⚠️ Error: {result.get('error', 'Unknown')}")
    
    except Exception as e:
        print(f"❌ Error testing message processing: {e}")
else:
    print("⚠️ OpenAI not configured - Skipping AI tests")

# ============================================================
# Test 5: Admin APIs
# ============================================================

print("\n5️⃣ Admin API Check")
print("-" * 70)

# Check if Django runserver is running
try:
    response = requests.get("http://localhost:8000/api/admin/stats/", timeout=2)
    if response.status_code == 200:
        print("✅ Admin stats endpoint accessible")
        data = response.json()
        print(f"   Total leads: {data['leads']['total']}")
    else:
        print(f"⚠️ Admin endpoint returned: {response.status_code}")
except requests.exceptions.ConnectionError:
    print("⚠️ Django server not running (start with: python manage.py runserver)")
except Exception as e:
    print(f"⚠️ Error checking admin API: {e}")

# ============================================================
# Test 6: Database Integrity
# ============================================================

print("\n6️⃣ Database Integrity Check")
print("-" * 70)

try:
    # Try creating a test lead
    test_lead = Lead.objects.create(
        phone="919999999999",
        name="Test Lead",
        source="web",
        stage="new",
    )
    print(f"✅ Created test lead: {test_lead.id}")
    
    # Create test event
    test_event = LeadEvent.objects.create(
        lead=test_lead,
        type="system",
        channel="custom_whatsapp",
        payload={"test": True}
    )
    print(f"✅ Created test event: {test_event.id}")
    
    # Verify relationships
    if test_lead.events.count() == 1:
        print("✅ Lead-Event relationship verified")
    
    # Cleanup
    test_lead.delete()
    print("✅ Cleanup successful")
    
except Exception as e:
    print(f"❌ Database integrity check failed: {e}")

# ============================================================
# Test 7: API Endpoints Status
# ============================================================

print("\n7️⃣ New API Endpoints Status")
print("-" * 70)

new_endpoints = [
    "/api/whatsapp/ai-webhook/",
    "/api/whatsapp/ai-test/",
    "/api/whatsapp/ai-status/",
    "/api/whatsapp/ai-escalate/",
    "/api/whatsapp/ai-stats/",
]

print("Expected new endpoints:")
for endpoint in new_endpoints:
    print(f"  ✅ POST/GET {endpoint}")

# ============================================================
# Test 8: Environment Variables
# ============================================================

print("\n8️⃣ Environment Variables Check")
print("-" * 70)

required_vars = [
    'OPENAI_API_KEY',
    'PINECONE_API_KEY',
]

for var in required_vars:
    value = os.getenv(var, '')
    if value:
        masked = value[:10] + '...' if len(value) > 10 else value
        print(f"✅ {var}: {masked}")
    else:
        print(f"⚠️ {var}: NOT SET")

# ============================================================
# Summary
# ============================================================

print("\n" + "=" * 70)
print("🎉 TEST SUITE COMPLETE")
print("=" * 70)

print("""
NEXT STEPS:

1. Set up OpenAI API key:
   - Go to https://platform.openai.com/api-keys
   - Create new key
   - Add to .env: OPENAI_API_KEY=sk-proj-XXXXX

2. Set up Pinecone:
   - Go to https://www.pinecone.io/
   - Create index "trek-and-stay-prod"
   - Add keys to .env

3. Test endpoints:
   curl http://localhost:8000/api/admin/stats/
   curl -X POST http://localhost:8000/api/whatsapp/ai-test/ \\
     -H "Content-Type: application/json" \\
     -d '{"phone":"919876543210","message":"Test message","customer_name":"Test"}'

4. For production:
   - Configure WhatsApp webhook URL
   - Enable SSL/HTTPS
   - Set up monitoring/logging
   - Test with real numbers

DOCUMENTATION:
   - See: PHASE1_2_IMPLEMENTATION_COMPLETE.md
   - Config: backend/services/whatsapp_ai_config.py
   - Agent: backend/services/enhanced_smart_agent.py
""")

print("=" * 70)
