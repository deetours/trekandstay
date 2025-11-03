#!/usr/bin/env python
"""
Standalone campaign monitoring implementation
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from core.models import Trip, Lead, MessageTemplate, OutboundMessage, LeadEvent, Task
from core.services import render_template_body
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

def run_campaign_monitoring(dry_run=True, force=False):
    """
    Monitor trip occupancy and trigger promotional campaigns
    """
    # Mock stdout for standalone execution
    class MockStdout:
        def write(self, text):
            print(text)
        @property
        def style(self):
            class MockStyle:
                def SUCCESS(self, text): return f"SUCCESS: {text}"
                def WARNING(self, text): return f"WARNING: {text}"
            return MockStyle()

    stdout = MockStdout()

    stdout.write("Starting campaign monitoring...")

    # Get current time for campaign scheduling
    now = timezone.now()

    # Find trips that need promotional campaigns
    campaigns_triggered = 0
    messages_queued = 0

    # Campaign trigger conditions:
    # 1. Trip is active and upcoming (within 90 days)
    # 2. Occupancy is below threshold (30% or 50% depending on urgency)
    # 3. No recent campaign was sent for this trip (avoid spam)

    upcoming_trips = Trip.objects.filter(
        status__in=['available', 'promoted'],
        next_departure__gte=now.date(),
        next_departure__lte=(now + timedelta(days=90)).date()
    )

    # Also include active trips without departure dates (treat as ongoing availability)
    active_trips_no_date = Trip.objects.filter(
        status__in=['available', 'promoted'],
        next_departure__isnull=True
    )

    # Combine querysets
    all_campaign_trips = list(upcoming_trips) + list(active_trips_no_date)

    for trip in all_campaign_trips:
        try:
            # Calculate occupancy percentage
            if trip.max_capacity and trip.max_capacity > 0:
                booked_spots = trip.max_capacity - (trip.spots_available or 0)
                occupancy_rate = (booked_spots / trip.max_capacity) * 100

                # Determine if campaign should be triggered
                should_trigger = False
                urgency_level = 'normal'

                if occupancy_rate < 30:
                    # Critical - very low occupancy
                    should_trigger = True
                    urgency_level = 'critical'
                elif occupancy_rate < 50:
                    # Moderate - getting low
                    should_trigger = True
                    urgency_level = 'moderate'

                if should_trigger:
                    # Check if we recently sent a campaign for this trip (avoid spam)
                    # Note: Using a simpler check since contains lookup may not work on all DB backends
                    recent_campaign = False
                    try:
                        # Check for recent campaigns by looking at lead metadata
                        recent_messages = OutboundMessage.objects.filter(
                            created_at__gte=now - timedelta(hours=24)
                        ).select_related('lead')
                        
                        for msg in recent_messages:
                            if msg.lead and msg.lead.metadata:
                                metadata = msg.lead.metadata
                                if isinstance(metadata, dict) and metadata.get('last_campaign', {}).get('trip_id') == trip.id:
                                    recent_campaign = True
                                    break
                    except Exception:
                        # If the check fails, allow the campaign to proceed
                        recent_campaign = False

                    # Trigger campaign for this trip
                    campaign_messages = trigger_trip_campaign(trip, urgency_level, dry_run)
                    messages_queued += campaign_messages
                    campaigns_triggered += 1

                    if not dry_run:
                        stdout.write(f"Triggered {urgency_level} campaign for {trip.name} ({occupancy_rate:.1f}% occupied)")
                    else:
                        stdout.write(f"DRY RUN: Would trigger {urgency_level} campaign for {trip.name} ({occupancy_rate:.1f}% occupied)")

        except Exception as e:
            logger.error(f"Error processing trip {trip.id}: {str(e)}")
            continue

    if dry_run:
        stdout.write(stdout.style.WARNING(f"DRY RUN COMPLETE: Would trigger {campaigns_triggered} campaigns, queue {messages_queued} messages"))
    else:
        stdout.write(stdout.style.SUCCESS(f"Campaign monitoring complete: {campaigns_triggered} campaigns triggered, {messages_queued} messages queued"))

def trigger_trip_campaign(trip, urgency_level, dry_run=False):
    """
    Trigger a promotional campaign for a specific trip
    """
    messages_queued = 0

    # Select qualified leads for this campaign
    qualified_leads = get_qualified_leads_for_trip(trip, urgency_level)

    if not qualified_leads:
        return 0

    # Get appropriate message template
    template_name = get_campaign_template_name(urgency_level)
    template = MessageTemplate.objects.filter(name=template_name, active=True).first()

    if not template:
        logger.warning(f"No active template found for {template_name}")
        return 0

    # Send campaign messages to qualified leads
    for lead in qualified_leads:
        try:
            if dry_run:
                messages_queued += 1
                continue

            # Personalize message variables
            variables = get_campaign_variables(trip, lead, urgency_level)

            # Render the template body with variables
            rendered_body = render_template_body(template, variables)

            # Queue the message
            message = OutboundMessage.objects.create(
                lead=lead,
                to=lead.phone,  # Use phone field
                template=template,
                rendered_body=rendered_body,
                scheduled_for=timezone.now() + timedelta(minutes=5)  # Small delay to avoid spam
            )

            # Store campaign metadata in lead
            lead.metadata = lead.metadata or {}
            lead.metadata['last_campaign'] = {
                'trip_id': trip.id,
                'trip_name': trip.name,
                'urgency_level': urgency_level,
                'sent_at': timezone.now().isoformat(),
                'message_id': message.id
            }
            lead.save(update_fields=['metadata'])

            # Create lead event for tracking
            LeadEvent.objects.create(
                lead=lead,
                event_type='campaign_message_sent',
                metadata={
                    'campaign_type': 'occupancy_promotion',
                    'trip_id': trip.id,
                    'trip_name': trip.name,
                    'urgency_level': urgency_level,
                    'template_used': template_name,
                    'message_id': message.id
                }
            )

            # Create follow-up task if this is a critical campaign
            if urgency_level == 'critical':
                Task.objects.create(
                    lead=lead,
                    type='campaign_followup',
                    status='pending',
                    due_at=timezone.now() + timedelta(hours=2),
                    description=f'Follow up on critical campaign for {trip.name}'
                )

            messages_queued += 1

        except Exception as e:
            logger.error(f"Error sending campaign message to lead {lead.id}: {str(e)}")
            continue

    return messages_queued

def get_qualified_leads_for_trip(trip, urgency_level):
    """
    Select qualified leads for campaign based on:
    - Has WhatsApp number
    - Recent engagement (last 30 days)
    - Not already booked this trip
    - Interest in similar destinations
    - Lead stage and qualification score
    """
    # Base criteria
    base_queryset = Lead.objects.filter(
        phone__isnull=False,
        phone__gt='',  # Not empty
        is_whatsapp=True,  # Must be WhatsApp leads
        last_contact_at__gte=timezone.now() - timedelta(days=30),  # Recent engagement
        stage__in=['interested', 'qualified', 'engaged']  # Active leads
    )

    print(f"  Found {base_queryset.count()} base qualified leads")

    # Exclude leads who already booked this trip
    existing_bookings = trip.bookings.values_list('user__username', flat=True)
    base_queryset = base_queryset.exclude(phone__in=existing_bookings)

    print(f"  After excluding existing bookings: {base_queryset.count()} leads")

    # Filter by interest in similar destinations (based on metadata)
    interested_leads = []
    for lead in base_queryset[:200]:  # Limit for performance
        try:
            metadata = lead.metadata or {}

            # Check if lead has shown interest in this type of trip
            interested_trips = metadata.get('interested_trips', [])
            trip_keywords = [trip.name.lower(), trip.location.lower() if trip.location else '']

            print(f"    Checking lead {lead.name}: interested_trips={interested_trips}, trip_keywords={trip_keywords}")

            # Simple keyword matching - case insensitive and partial
            has_interest = any(
                any(keyword.lower() in trip_name.lower() or trip_name.lower() in keyword.lower()
                    for keyword in trip_keywords if keyword)
                for trip_name in interested_trips
            )

            # Also check lead source and qualification
            qualification_score = metadata.get('qualification_score', 0)
            lead_source = lead.source or ''

            # Scoring criteria
            score = 0
            if has_interest:
                score += 30
            if qualification_score >= 50:
                score += 20
            if 'whatsapp' in lead_source.lower():
                score += 15
            if lead.stage == 'qualified':
                score += 10

            print(f"      has_interest={has_interest}, score={score}")

            # Urgency-based thresholds
            min_score = 30 if urgency_level == 'critical' else 50

            if score >= min_score:
                interested_leads.append(lead)
                print(f"      -> SELECTED")
            else:
                print(f"      -> REJECTED (score {score} < {min_score})")

        except Exception as e:
            logger.error(f"Error evaluating lead {lead.id}: {str(e)}")
            continue

    print(f"  Final qualified leads: {len(interested_leads)}")
    # Return top leads (limit to prevent spam)
    return interested_leads[:50]  # Max 50 messages per campaign

def get_campaign_template_name(urgency_level):
    """
    Get appropriate template name based on urgency level
    """
    template_map = {
        'critical': 'campaign_critical_occupancy',
        'moderate': 'campaign_moderate_occupancy',
        'normal': 'campaign_normal_occupancy'
    }
    return template_map.get(urgency_level, 'campaign_normal_occupancy')

def get_campaign_variables(trip, lead, urgency_level):
    """
    Generate personalized variables for campaign messages
    """
    # Calculate discount/special offer based on urgency
    discount_percent = 0
    if urgency_level == 'critical':
        discount_percent = 15
    elif urgency_level == 'moderate':
        discount_percent = 10

    # Calculate discounted price
    original_price = trip.price or 0
    discounted_price = original_price * (1 - discount_percent / 100) if discount_percent > 0 else original_price

    return {
        'lead_name': lead.name.split()[0] if lead.name else 'Traveler',
        'trip_name': trip.name,
        'trip_location': trip.location or 'Amazing Destination',
        'original_price': f"₹{original_price:,.0f}",
        'discounted_price': f"₹{discounted_price:,.0f}" if discount_percent > 0 else f"₹{original_price:,.0f}",
        'discount_percent': f"{discount_percent}%" if discount_percent > 0 else "",
        'spots_left': trip.spots_available or 0,
        'start_date': trip.next_departure.strftime('%B %d, %Y') if trip.next_departure else 'TBD',
        'urgency_level': urgency_level,
        'booking_deadline': (timezone.now() + timedelta(days=7)).strftime('%B %d') if urgency_level == 'critical' else 'Soon'
    }

if __name__ == '__main__':
    # Run in dry-run mode by default
    run_campaign_monitoring(dry_run=True)