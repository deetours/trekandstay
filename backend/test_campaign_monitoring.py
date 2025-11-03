#!/usr/bin/env python
"""
Test script for campaign monitoring functionality
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from core.models import Trip, Lead, MessageTemplate
from django.utils import timezone
from datetime import timedelta

def test_campaign_monitoring():
    print("Testing campaign monitoring...")

    # Get upcoming trips
    now = timezone.now()
    upcoming_trips = Trip.objects.filter(
        status__in=['available', 'promoted'],
        next_departure__gte=now.date(),
        next_departure__lte=(now + timedelta(days=90)).date()
    )

    # Also include active trips without departure dates
    active_trips_no_date = Trip.objects.filter(
        status__in=['available', 'promoted'],
        next_departure__isnull=True
    )

    # Combine querysets
    all_campaign_trips = list(upcoming_trips) + list(active_trips_no_date)

    print(f"Found {len(all_campaign_trips)} trips eligible for campaigns")

    campaigns_triggered = 0
    messages_queued = 0

    for trip in all_campaign_trips:
        print(f"\nChecking trip: {trip.name}")
        print(f"  Status: {trip.status}")
        print(f"  Next departure: {trip.next_departure}")
        print(f"  Max capacity: {trip.max_capacity}")
        print(f"  Spots available: {trip.spots_available}")

        if trip.max_capacity and trip.max_capacity > 0:
            booked_spots = trip.max_capacity - (trip.spots_available or 0)
            occupancy_rate = (booked_spots / trip.max_capacity) * 100
            print(".1f")

            if occupancy_rate < 50:  # Test with moderate threshold
                print(f"  -> Would trigger campaign (occupancy < 50%)")
                campaigns_triggered += 1

                # Count qualified leads
                qualified_leads = Lead.objects.filter(
                    phone__isnull=False,
                    phone__gt='',
                    is_whatsapp=True,
                    last_contact_at__gte=now - timedelta(days=30),
                    stage__in=['interested', 'qualified', 'engaged']
                )[:10]  # Just count first 10 for test

                messages_queued += qualified_leads.count()
                print(f"  -> Would send to {qualified_leads.count()} qualified leads")
            else:
                print("  -> No campaign needed (good occupancy)")
    print("\nSummary:")
    print(f"  Campaigns that would be triggered: {campaigns_triggered}")
    print(f"  Messages that would be queued: {messages_queued}")

    # Check templates
    templates = MessageTemplate.objects.filter(name__startswith='campaign_')
    print(f"\nCampaign templates available: {templates.count()}")
    for template in templates:
        print(f"  - {template.name}")

if __name__ == '__main__':
    test_campaign_monitoring()