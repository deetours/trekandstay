#!/usr/bin/env python
"""
Simple test script to verify backend functionality
"""
import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

def test_database_connection():
    """Test database connection"""
    try:
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        row = cursor.fetchone()
        print("✅ Database connection: SUCCESS")
        return True
    except Exception as e:
        print(f"❌ Database connection: FAILED - {e}")
        return False

def test_models():
    """Test model imports and basic operations"""
    try:
        from core.models import UserProfile, Trip, Booking
        print("✅ Model imports: SUCCESS")
        
        # Test model counts
        trip_count = Trip.objects.count()
        booking_count = Booking.objects.count()
        user_count = UserProfile.objects.count()
        
        print(f"📊 Database stats:")
        print(f"   - Trips: {trip_count}")
        print(f"   - Bookings: {booking_count}")
        print(f"   - Users: {user_count}")
        return True
    except Exception as e:
        print(f"❌ Model operations: FAILED - {e}")
        return False

def test_firebase_config():
    """Test Firebase configuration"""
    try:
        firebase_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
        if firebase_path and os.path.exists(firebase_path):
            print("✅ Firebase credentials: SUCCESS")
            return True
        else:
            print(f"❌ Firebase credentials: FAILED - Path not found: {firebase_path}")
            return False
    except Exception as e:
        print(f"❌ Firebase configuration: FAILED - {e}")
        return False

def test_api_imports():
    """Test API view imports"""
    try:
        from core.views import me, dashboard_summary, auth_google
        print("✅ API view imports: SUCCESS")
        return True
    except Exception as e:
        print(f"❌ API view imports: FAILED - {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Backend Infrastructure...")
    print("=" * 50)
    
    tests = [
        test_database_connection,
        test_models,
        test_firebase_config,
        test_api_imports
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Backend infrastructure is fully operational!")
        exit(0)
    else:
        print("⚠️  Backend has some issues that need attention")
        exit(1)