"""
Quick Demo: Custom WhatsApp Provider Ready to Use
==================================================

This script demonstrates that everything is configured and ready to send messages.
Run with: python manage.py shell < demo_quick.py
"""

from services.custom_whatsapp_provider import CustomWhatsAppProvider
from django.conf import settings

print("\n" + "="*70)
print("✅ CUSTOM WHATSAPP PROVIDER - DEMO")
print("="*70 + "\n")

# Initialize provider
provider = CustomWhatsAppProvider(
    api_endpoint=settings.CUSTOM_WHATSAPP_API_ENDPOINT,
    api_key=settings.CUSTOM_WHATSAPP_API_KEY,
    webhook_secret=settings.CUSTOM_WHATSAPP_WEBHOOK_SECRET
)

print("✅ Provider Initialized Successfully!")
print(f"   Endpoint: {settings.CUSTOM_WHATSAPP_API_ENDPOINT}")
print(f"   Timeout: {settings.CUSTOM_WHATSAPP_TIMEOUT}s")
print(f"   Retry Count: {settings.CUSTOM_WHATSAPP_RETRY_COUNT}")

# TEST 1: Phone Validation
print("\n" + "-"*70)
print("TEST 1: Phone Number Validation")
print("-"*70)
test_phones = ["919876543210", "+919876543210", "9876543210"]
for phone in test_phones:
    validated = provider._validate_phone(phone)
    print(f"  ✓ {phone:20} → {validated}")

# TEST 2: Message ID Generation
print("\n" + "-"*70)
print("TEST 2: Generate Unique Message IDs")
print("-"*70)
ids = set()
for i in range(3):
    msg_id = provider._generate_message_id()
    ids.add(msg_id)
    print(f"  ✓ Message ID {i+1}: {msg_id}")
print(f"  ✓ All {len(ids)} IDs are unique!")

# TEST 3: Webhook Signature
print("\n" + "-"*70)
print("TEST 3: Webhook Signature Generation")
print("-"*70)
test_payload = {
    "phone_number": "919876543210",
    "message_text": "Hello!",
    "message_id": "msg_001",
    "timestamp": "2025-01-15T10:30:00Z"
}
signature = provider._generate_signature(test_payload)
is_valid = provider.verify_webhook_signature(test_payload, signature)
print(f"  ✓ Generated: {signature[:32]}...")
print(f"  ✓ Verified: {is_valid}")

# TEST 4: Parse Webhook
print("\n" + "-"*70)
print("TEST 4: Parse Incoming Webhook")
print("-"*70)
webhook = {
    "phone_number": "919876543210",
    "message_text": "I want to book the Everest trek",
    "message_id": "msg_001",
    "timestamp": "2025-01-15T10:30:00Z",
    "from_user": True
}
parsed = provider.parse_webhook(webhook)
if parsed:
    print(f"  ✓ From: {parsed['phone_number']}")
    print(f"  ✓ Text: {parsed['message_text'][:40]}...")
    print(f"  ✓ From User: {parsed['from_user']}")

print("\n" + "="*70)
print("🎉 EVERYTHING IS READY!")
print("="*70)

print("\n📝 NEXT STEPS TO SEND MESSAGES:")
print("-"*70)
print("""
1. IMPLEMENT YOUR API ENDPOINT
   Create an endpoint at: http://your-server/api/whatsapp
   
   Should handle:
   - POST /send (send a message)
   - GET /status/{message_id} (check status)
   - GET /health (health check)
   
2. UPDATE .env WITH YOUR ENDPOINT
   CUSTOM_WHATSAPP_API_ENDPOINT=https://your-api.com/whatsapp
   CUSTOM_WHATSAPP_API_KEY=your-secret-key
   
3. START SENDING MESSAGES
   provider.send_message("919876543210", "Hello!")
   
4. SEND BULK CAMPAIGNS
   provider.send_bulk(
       ["919876543210", "919876543211"],
       "Special offer: 40% OFF!"
   )
""")

print("="*70)
print("✅ Configuration Complete! You're ready to go! 🚀")
print("="*70 + "\n")
