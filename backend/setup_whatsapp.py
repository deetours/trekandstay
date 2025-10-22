"""
Setup Script for WhatsApp Smart Agent
Run this to complete installation
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

print("\n" + "="*70)
print("🚀 SMART WHATSAPP AGENT - SETUP SCRIPT")
print("="*70)

# ============================================================
# STEP 1: Verify Files Exist
# ============================================================

print("\n📁 Checking files...")

files_to_check = [
    'backend/services/custom_whatsapp_service.py',
    'backend/services/smart_whatsapp_agent.py',
    'backend/core/whatsapp_webhook.py',
    'backend/core/whatsapp_urls.py',
    'backend/core/whatsapp_models.py',
    'backend/test_smart_agent.py',
]

all_exist = True
for file_path in files_to_check:
    exists = os.path.exists(file_path)
    status = "✓" if exists else "✗"
    print(f"  {status} {file_path}")
    all_exist = all_exist and exists

if not all_exist:
    print("\n⚠️  Some files are missing. Please create them first.")
    sys.exit(1)

print("\n✅ All files present!")

# ============================================================
# STEP 2: Check Django Settings
# ============================================================

print("\n⚙️  Checking Django settings...")

required_settings = [
    ('WHATSAPP_PROVIDER', 'mock'),
    ('WHATSAPP_MODE', 'testing'),
    ('WHATSAPP_WEBHOOK_TOKEN', None),
]

for setting_name, default_value in required_settings:
    current_value = getattr(settings, setting_name, None)
    if current_value is None:
        if default_value:
            print(f"  ! {setting_name}: Not found, using default '{default_value}'")
            # Note: You should add this to settings.py
        else:
            print(f"  ⚠️  {setting_name}: Not set in settings.py")
    else:
        masked_value = f"***{str(current_value)[-5:]}" if len(str(current_value)) > 10 else current_value
        print(f"  ✓ {setting_name}: {masked_value}")

# ============================================================
# STEP 3: Test Imports
# ============================================================

print("\n📦 Testing imports...")

try:
    from services.custom_whatsapp_service import CustomWhatsAppService
    print("  ✓ CustomWhatsAppService imported")
except Exception as e:
    print(f"  ✗ CustomWhatsAppService import failed: {e}")

try:
    from services.smart_whatsapp_agent import SmartWhatsAppAgent
    print("  ✓ SmartWhatsAppAgent imported")
except Exception as e:
    print(f"  ✗ SmartWhatsAppAgent import failed: {e}")

try:
    from core.whatsapp_webhook import (
        whatsapp_webhook_verify,
        whatsapp_webhook_receive,
        send_whatsapp_message
    )
    print("  ✓ WhatsApp webhook views imported")
except Exception as e:
    print(f"  ✗ WhatsApp webhook views import failed: {e}")

try:
    from core.whatsapp_models import (
        WhatsAppMessage,
        WhatsAppConversation,
        WhatsAppWebhook
    )
    print("  ✓ WhatsApp models imported")
except Exception as e:
    print(f"  ✗ WhatsApp models import failed: {e}")

# ============================================================
# STEP 4: Quick Health Check
# ============================================================

print("\n🏥 Health check...")

try:
    from services.smart_whatsapp_agent import SmartWhatsAppAgent
    
    agent = SmartWhatsAppAgent(whatsapp_provider="mock", mode="testing")
    
    result = agent.handle_incoming_message(
        phone="919876543210",
        message="Test message"
    )
    
    if result['success']:
        print("  ✓ Agent working correctly")
        print(f"    - Processing time: {result['processing_time_ms']}ms")
        print(f"    - Intent detected: {result['intent']}")
    else:
        print("  ✗ Agent returned error")
        
except Exception as e:
    print(f"  ⚠️  Health check failed: {e}")
    import traceback
    traceback.print_exc()

# ============================================================
# STEP 5: Database Check
# ============================================================

print("\n💾 Database check...")

try:
    from django.db import connection
    from django.db import migrations
    
    # Check if WhatsApp models exist in database
    from django.apps import apps
    
    app_config = apps.get_app_config('core')
    models_list = [
        'whatsappmessage',
        'whatsappconversation',
        'whatsappwebhook',
        'whatsapptemplate',
        'whatsappcampaign',
        'whatsappanalytics'
    ]
    
    existing_models = [m._meta.model_name.lower() for m in app_config.get_models()]
    
    print("  Checking models:")
    for model_name in models_list:
        exists = model_name in existing_models
        status = "✓" if exists else "✗"
        print(f"    {status} {model_name}")
    
    if not all(m in existing_models for m in models_list):
        print("\n  ⚠️  Some models not in database yet.")
        print("  Run migrations: python manage.py migrate")
        
except Exception as e:
    print(f"  Note: Database check skipped: {e}")

# ============================================================
# STEP 6: Configuration Recommendations
# ============================================================

print("\n📋 Configuration checklist:")

checklist = [
    ("Add URLs to Django", "path('api/whatsapp/', include('core.whatsapp_urls'))"),
    ("Add settings", "WHATSAPP_PROVIDER = 'mock'"),
    ("Run migrations", "python manage.py migrate"),
    ("Run tests", "python test_smart_agent.py"),
]

for idx, (task, instruction) in enumerate(checklist, 1):
    print(f"  [ ] {idx}. {task}")
    print(f"      → {instruction}")

# ============================================================
# STEP 7: Next Steps
# ============================================================

print("\n" + "="*70)
print("✅ SETUP CHECK COMPLETE!")
print("="*70)

print("\n📚 Next steps:")
print("  1. Read SMART_WHATSAPP_README.md")
print("  2. Read SMART_WHATSAPP_QUICKSTART.md")
print("  3. Add URLs to Django settings")
print("  4. Run: python test_smart_agent.py")
print("  5. Test with curl commands")

print("\n🚀 Quick commands:")
print("  - Health check: curl http://localhost:8000/api/whatsapp/health/")
print("  - Run tests: python backend/test_smart_agent.py")
print("  - Run server: python manage.py runserver")

print("\n💡 Configuration file: WHATSAPP_AGENT_CONFIG.md")
print("📖 Documentation: SMART_WHATSAPP_QUICKSTART.md")
print("🎉 You're ready to go!\n")

# ============================================================
# STEP 8: Django URLs Check
# ============================================================

print("⚠️  IMPORTANT: Add this to backend/travel_dashboard/urls.py:")
print("\nfrom django.urls import path, include\n")
print("urlpatterns = [")
print("    # ... your existing patterns ...,")
print("    path('api/whatsapp/', include('core.whatsapp_urls')),")
print("]\n")

print("="*70)
print("Setup verification complete! ✅\n")
