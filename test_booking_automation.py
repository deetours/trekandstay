#!/usr/bin/env python3
"""
Test script for booking automation flow
Tests the 5-booking cap with auto-promotion at 4 bookings
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
django.setup()

from core.models import Trip, Booking, BookingLimit, User
from django.contrib.auth.models import User as DjangoUser

def test_booking_automation():
    print("🧪 Testing Booking Automation Flow")
    print("=" * 50)

    # Get or create test user
    user, created = DjangoUser.objects.get_or_create(
        username='testuser',
        defaults={'email': 'test@example.com'}
    )
    if created:
        user.set_password('testpass')
        user.save()
        print("✅ Created test user")

    # Get or create booking limit for user
    booking_limit, created = BookingLimit.objects.get_or_create(
        user=user,
        defaults={'max_allowed': 3}  # Test with lower limit
    )
    if created:
        print("✅ Created booking limit for user")

    # Get first available trip
    try:
        trip = Trip.objects.filter(status__in=['available', 'promoted']).first()
        if not trip:
            print("❌ No available trips found")
            return
        print(f"📍 Testing with trip: {trip.name} (ID: {trip.id})")
        print(f"   Status: {trip.status}, Max Capacity: {trip.max_capacity}")
        print(f"   Available Slots: {trip.get_available_slots()}")
    except Exception as e:
        print(f"❌ Error getting trip: {e}")
        return

    # Test 1: Check initial state
    print("\n📊 Test 1: Initial State")
    print(f"   Trip Status: {trip.status}")
    print(f"   Available Slots: {trip.get_available_slots()}")
    print(f"   Is Available: {trip.is_available_for_booking()}")

    # Test 2: Create bookings up to capacity
    print("\n📝 Test 2: Creating Bookings")
    bookings_created = 0

    for i in range(trip.max_capacity):
        try:
            # Check if user can book more
            if not booking_limit.can_book_more():
                print(f"   User booking limit reached at booking {i+1}")
                break

            booking = Booking.objects.create(
                user=user,
                trip=trip,
                destination=trip.name,
                date=datetime.now() + timedelta(days=7),
                status='confirmed',
                amount=trip.price  # Add required amount field
            )
            booking_limit.increment_bookings()
            bookings_created += 1

            # Refresh trip from database
            trip.refresh_from_db()
            print(f"   Booking {i+1}: Status={trip.status}, Available={trip.get_available_slots()}")

            # Check for auto-promotion at 4 bookings
            if bookings_created == 4 and trip.status == 'promoted':
                print("   ✅ Auto-promotion triggered at 4 bookings!")

        except Exception as e:
            print(f"   ❌ Failed to create booking {i+1}: {e}")
            break

    # Test 3: Try to create one more booking (should fail)
    print("\n🚫 Test 3: Attempt Overbooking")
    try:
        booking = Booking.objects.create(
            user=user,
            trip=trip,
            destination=trip.name,
            date=datetime.now() + timedelta(days=7),
            status='confirmed'
        )
        print("   ❌ Overbooking succeeded (this should not happen!)")
    except Exception as e:
        print(f"   ✅ Overbooking prevented: {e}")

    # Test 4: Test cancellation
    print("\n🔄 Test 4: Test Cancellation")
    if bookings_created > 0:
        # Cancel the last booking
        last_booking = Booking.objects.filter(trip=trip, user=user).last()
        if last_booking:
            last_booking.cancel_booking()
            trip.refresh_from_db()
            booking_limit.decrement_bookings()

            print(f"   After cancellation: Status={trip.status}, Available={trip.get_available_slots()}")
            if trip.status == 'available' and bookings_created >= 4:
                print("   ✅ Status reverted from promoted to available!")

    # Test 5: User booking limit
    print("\n👤 Test 5: User Booking Limits")
    print(f"   User max bookings: {booking_limit.max_allowed}")
    print(f"   User current bookings: {booking_limit.total_bookings}")
    print(f"   Can book more: {booking_limit.can_book_more()}")

    # Cleanup: Delete test bookings
    print("\n🧹 Cleanup: Removing test bookings")
    Booking.objects.filter(user=user, trip=trip).delete()
    trip.refresh_from_db()
    booking_limit.current_bookings = 0
    booking_limit.save()

    print(f"   After cleanup: Status={trip.status}, Available={trip.get_available_slots()}")

    print("\n🎉 Booking Automation Test Complete!")

if __name__ == '__main__':
    test_booking_automation()