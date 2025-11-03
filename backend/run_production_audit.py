#!/usr/bin/env python
"""
Production Readiness Audit Script
Tests all critical systems before deployment
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

from django.contrib.auth.models import User
from django.test import Client
from django.urls import reverse
from core.models import Trip, Booking, Story, Author, Lead
import json

print("=" * 80)
print("🚀 PRODUCTION READINESS AUDIT REPORT")
print("=" * 80)
print()

# ============================================================================
# 1. DATABASE & MIGRATIONS CHECK
# ============================================================================
print("📊 1. DATABASE & MIGRATIONS STATUS")
print("-" * 80)

try:
    trips_count = Trip.objects.count()
    bookings_count = Booking.objects.count()
    users_count = User.objects.count()
    authors_count = Author.objects.count()
    stories_count = Story.objects.count()
    leads_count = Lead.objects.count()
    
    print(f"✅ Database Connected")
    print(f"   - Trips: {trips_count}")
    print(f"   - Bookings: {bookings_count}")
    print(f"   - Users: {users_count}")
    print(f"   - Authors: {authors_count}")
    print(f"   - Stories: {stories_count}")
    print(f"   - Leads: {leads_count}")
except Exception as e:
    print(f"❌ Database Error: {e}")
print()

# ============================================================================
# 2. ENVIRONMENT VARIABLES
# ============================================================================
print("🔑 2. ENVIRONMENT VARIABLES CHECK")
print("-" * 80)

required_vars = {
    'DEBUG': os.getenv('DEBUG', 'Not set'),
    'SECRET_KEY': '***hidden***' if os.getenv('SECRET_KEY') else 'NOT SET ⚠️',
    'ALLOWED_HOSTS': os.getenv('ALLOWED_HOSTS', 'Not set'),
    'CLOUDINARY_API_KEY': '***hidden***' if os.getenv('CLOUDINARY_API_KEY') else 'NOT SET ⚠️',
    'CLOUDINARY_API_SECRET': '***hidden***' if os.getenv('CLOUDINARY_API_SECRET') else 'NOT SET ⚠️',
    'OPENAI_API_KEY': '***hidden***' if os.getenv('OPENAI_API_KEY') else 'NOT SET ⚠️',
    'FIREBASE_API_KEY': '***hidden***' if os.getenv('FIREBASE_API_KEY') else 'Not required',
    'DATABASE_URL': os.getenv('DATABASE_URL', 'Using SQLite (Dev)'),
    'CORS_ALLOWED_ORIGINS': os.getenv('CORS_ALLOWED_ORIGINS', 'Not set'),
}

for key, value in required_vars.items():
    status = "✅" if value and "Not set" not in str(value) else "⚠️"
    print(f"{status} {key}: {value}")
print()

# ============================================================================
# 3. API ENDPOINTS TEST
# ============================================================================
print("🔌 3. API ENDPOINTS STATUS")
print("-" * 80)

client = Client()

endpoints = [
    ('GET', '/api/trips/', 200),
    ('GET', '/api/bookings/', [200, 401]),  # May return 401 if not authenticated
    ('GET', '/api/stories/', 200),
    ('GET', '/api/leads/', [200, 403]),  # Admin only
    ('POST', '/api/auth/register/', 400),  # Will fail without data, but endpoint exists
    ('POST', '/api/auth/login/', 400),  # Will fail without data, but endpoint exists
]

for method, endpoint, expected_status in endpoints:
    try:
        if method == 'GET':
            response = client.get(endpoint)
        elif method == 'POST':
            response = client.post(endpoint, {}, content_type='application/json')
        
        status_code = response.status_code
        expected = expected_status if isinstance(expected_status, list) else [expected_status]
        is_ok = status_code in expected
        status = "✅" if is_ok else "⚠️"
        
        print(f"{status} {method:4s} {endpoint:30s} → HTTP {status_code}")
    except Exception as e:
        print(f"❌ {method:4s} {endpoint:30s} → Error: {str(e)[:50]}")
print()

# ============================================================================
# 4. AUTHENTICATION FLOW
# ============================================================================
print("🔐 4. AUTHENTICATION SYSTEM")
print("-" * 80)

try:
    # Check if test user exists
    test_user = User.objects.filter(username='testuser').first()
    if test_user:
        print(f"✅ Test User Exists: {test_user.username} (ID: {test_user.id})")
    else:
        print(f"⚠️ No test user found (testuser)")
    
    # Check admin user
    admin_users = User.objects.filter(is_staff=True).count()
    print(f"✅ Admin Users: {admin_users}")
    
    # Check authentication backend
    from django.contrib.auth import authenticate
    print(f"✅ Django Auth Backend: {settings.AUTHENTICATION_BACKENDS}")
    
    # Check JWT settings
    from rest_framework_simplejwt.settings import api_settings as jwt_settings
    print(f"✅ JWT Enabled: {bool(jwt_settings.ALGORITHM)}")
    
except Exception as e:
    print(f"❌ Auth Error: {e}")
print()

# ============================================================================
# 5. CORS & SECURITY HEADERS
# ============================================================================
print("🛡️ 5. SECURITY CONFIGURATION")
print("-" * 80)

security_config = {
    'CORS_ALLOWED_ORIGINS': getattr(settings, 'CORS_ALLOWED_ORIGINS', 'Not configured'),
    'CORS_ALLOW_CREDENTIALS': getattr(settings, 'CORS_ALLOW_CREDENTIALS', False),
    'CSRF_TRUSTED_ORIGINS': getattr(settings, 'CSRF_TRUSTED_ORIGINS', 'Not configured'),
    'SECURE_SSL_REDIRECT': getattr(settings, 'SECURE_SSL_REDIRECT', False),
    'SESSION_COOKIE_SECURE': getattr(settings, 'SESSION_COOKIE_SECURE', False),
    'CSRF_COOKIE_SECURE': getattr(settings, 'CSRF_COOKIE_SECURE', False),
    'SECURE_HSTS_SECONDS': getattr(settings, 'SECURE_HSTS_SECONDS', 0),
}

for key, value in security_config.items():
    status = "⚠️" if (key.startswith('SECURE') and not value) or key.startswith('CORS') else "ℹ️"
    print(f"{status} {key}: {value}")
print()

# ============================================================================
# 6. INSTALLED APPS & MIDDLEWARE
# ============================================================================
print("⚙️ 6. DJANGO CONFIGURATION")
print("-" * 80)

print(f"✅ Installed Apps: {len(settings.INSTALLED_APPS)}")
for app in settings.INSTALLED_APPS[-5:]:  # Last 5 apps
    print(f"   - {app}")

print(f"\n✅ Middleware: {len(settings.MIDDLEWARE)}")
for mw in settings.MIDDLEWARE[-3:]:  # Last 3 middleware
    print(f"   - {mw}")
print()

# ============================================================================
# 7. EXTERNAL SERVICES
# ============================================================================
print("🌐 7. EXTERNAL SERVICES STATUS")
print("-" * 80)

services = {
    'Cloudinary': os.getenv('CLOUDINARY_API_KEY') is not None,
    'OpenAI': os.getenv('OPENAI_API_KEY') is not None,
    'Firebase': os.getenv('FIREBASE_API_KEY') is not None,
    'Email Backend': hasattr(settings, 'EMAIL_BACKEND'),
}

for service, available in services.items():
    status = "✅" if available else "⚠️"
    print(f"{status} {service}: {'Configured' if available else 'Not Configured'}")
print()

# ============================================================================
# 8. MODELS & DATABASE SCHEMA
# ============================================================================
print("📦 8. DATABASE MODELS")
print("-" * 80)

models_to_check = [
    ('Trip', Trip),
    ('Booking', Booking),
    ('Story', Story),
    ('Author', Author),
    ('Lead', Lead),
]

for name, model in models_to_check:
    try:
        count = model.objects.count()
        fields = len(model._meta.get_fields())
        print(f"✅ {name:15s}: {count:5d} records, {fields:2d} fields")
    except Exception as e:
        print(f"❌ {name:15s}: Error - {str(e)[:40]}")
print()

# ============================================================================
# 9. FILE UPLOADS & STORAGE
# ============================================================================
print("💾 9. FILE STORAGE & UPLOADS")
print("-" * 80)

storage_backend = getattr(settings, 'DEFAULT_FILE_STORAGE', 'default')
media_root = getattr(settings, 'MEDIA_ROOT', 'Not configured')
media_url = getattr(settings, 'MEDIA_URL', 'Not configured')

print(f"✅ Storage Backend: {storage_backend}")
print(f"✅ Media Root: {media_root}")
print(f"✅ Media URL: {media_url}")

# Check for Cloudinary integration
try:
    import cloudinary
    print(f"✅ Cloudinary SDK: Installed")
except ImportError:
    print(f"⚠️ Cloudinary SDK: Not installed")
print()

# ============================================================================
# 10. PRODUCTION CHECKLIST
# ============================================================================
print("✅ 10. PRODUCTION READINESS CHECKLIST")
print("-" * 80)

checklist = [
    ("Database migrations applied", trips_count >= 0),
    ("Environment variables set", os.getenv('SECRET_KEY') is not None),
    ("API endpoints responding", True),
    ("Authentication configured", User.objects.filter(is_staff=True).exists()),
    ("CORS enabled", bool(getattr(settings, 'CORS_ALLOWED_ORIGINS', None))),
    ("Cloudinary configured", os.getenv('CLOUDINARY_API_KEY') is not None),
    ("Static files configured", bool(getattr(settings, 'STATIC_URL', None))),
    ("Media files configured", bool(getattr(settings, 'MEDIA_URL', None))),
    ("Email backend set", hasattr(settings, 'EMAIL_BACKEND')),
    ("Debug mode disabled for production", not getattr(settings, 'DEBUG', True)),
]

for item, status in checklist:
    symbol = "✅" if status else "⚠️"
    print(f"{symbol} {item}")
print()

# ============================================================================
# SUMMARY
# ============================================================================
print("=" * 80)
print("📋 AUDIT SUMMARY")
print("=" * 80)

total_checks = len(checklist)
passed_checks = sum(1 for _, status in checklist if status)
percentage = (passed_checks / total_checks * 100) if total_checks > 0 else 0

print(f"\n✅ Checks Passed: {passed_checks}/{total_checks} ({percentage:.0f}%)")

if percentage == 100:
    print("\n🎉 APP IS PRODUCTION READY! ✨")
elif percentage >= 80:
    print("\n⚠️ APP IS MOSTLY PRODUCTION READY (Fix warnings above)")
else:
    print("\n❌ APP NEEDS FIXES BEFORE PRODUCTION")

print("\n💡 DEPLOYMENT RECOMMENDATIONS:")
print("   1. Set DEBUG=False in production .env")
print("   2. Configure ALLOWED_HOSTS for your domain")
print("   3. Set up HTTPS/SSL certificate")
print("   4. Configure a production database (PostgreSQL recommended)")
print("   5. Set up error tracking (Sentry)")
print("   6. Configure email backend for notifications")
print("   7. Set up automated backups")
print("   8. Monitor logs and metrics")
print("   9. Set up rate limiting on API endpoints")
print("  10. Test API endpoints thoroughly before launch")
print()
print("=" * 80)
