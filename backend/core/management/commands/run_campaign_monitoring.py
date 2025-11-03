from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction, models
from core.models import Trip, Lead, MessageTemplate, OutboundMessage, CampaignAnalytics, LeadEvent, Task
from core.services import enqueue_template_message, render_template_body
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Monitor trip occupancy and trigger promotional campaigns for low-occupancy trips"

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show what would be done without actually sending messages')
        parser.add_argument('--force', action='store_true', help='Force campaign triggers regardless of timing restrictions')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']

        self.stdout.write("Starting campaign monitoring...")

        # Initialize counters
        campaigns_triggered = 0
        messages_queued = 0

        # Get current time for campaign scheduling
        now = timezone.now()

        # Find trips that need promotional campaigns
        # Include both trips with upcoming departures and active trips without dates
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
                # Calculate occupancy percentage based on confirmed bookings
                if trip.max_capacity and trip.max_capacity > 0:
                    confirmed_bookings = trip.bookings.filter(status='confirmed').count()
                    occupancy_rate = (confirmed_bookings / trip.max_capacity) * 100

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
                        # Use a simpler approach that doesn't rely on JSONField contains lookup
                        recent_campaign = OutboundMessage.objects.filter(
                            lead__in=Lead.objects.filter(phone__isnull=False),
                            template__name__startswith='campaign_',
                            created_at__gte=now - timedelta(hours=24)
                        ).filter(
                            models.Q(rendered_body__icontains=trip.name) |
                            models.Q(lead__metadata__icontains=str(trip.id))
                        ).exists()

                        if recent_campaign and not force:
                            self.stdout.write(f"Skipping {trip.name} - recent campaign exists")
                            continue

                        # Trigger campaign for this trip
                        campaign_messages = self.trigger_trip_campaign(trip, urgency_level, dry_run)
                        messages_queued += campaign_messages
                        campaigns_triggered += 1

                        if not dry_run:
                            self.stdout.write(f"Triggered {urgency_level} campaign for {trip.name} ({occupancy_rate:.1f}% occupied)")
                        else:
                            self.stdout.write(f"DRY RUN: Would trigger {urgency_level} campaign for {trip.name} ({occupancy_rate:.1f}% occupied)")

            except Exception as e:
                logger.error(f"Error processing trip {trip.id}: {str(e)}")
                continue

        if dry_run:
            self.stdout.write(self.style.WARNING(f"DRY RUN COMPLETE: Would trigger {campaigns_triggered} campaigns, queue {messages_queued} messages"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Campaign monitoring complete: {campaigns_triggered} campaigns triggered, {messages_queued} messages queued"))

    def trigger_trip_campaign(self, trip, urgency_level, dry_run=False):
        """
        Trigger a promotional campaign for a specific trip
        """
        messages_queued = 0

        # Select qualified leads for this campaign
        qualified_leads = self.get_qualified_leads_for_trip(trip, urgency_level)

        if not qualified_leads:
            return 0

        # Get appropriate message template
        template_name = self.get_campaign_template_name(urgency_level)
        template = MessageTemplate.objects.filter(name=template_name, active=True).first()

        if not template:
            logger.warning(f"No active template found for {template_name}")
            return 0

        # Create campaign analytics record (only if not dry run)
        campaign_analytics = None
        if not dry_run:
            # Get sample rendered body for analytics
            sample_lead = qualified_leads[0]
            variables = self.get_campaign_variables(trip, sample_lead, urgency_level)
            rendered_body = render_template_body(template, variables)
            
            campaign_analytics = CampaignAnalytics.objects.create(
                campaign_type='occupancy_monitoring',
                urgency_level=urgency_level,
                trip=trip,
                template_used=template,
                message_body=rendered_body,
                target_leads_count=len(qualified_leads),
                qualified_leads_count=len(qualified_leads)
            )
            logger.info(f"Created campaign analytics record for {trip.name}")

        # Send campaign messages to qualified leads
        for lead in qualified_leads:
            try:
                if dry_run:
                    messages_queued += 1
                    continue

                # Personalize message variables
                variables = self.get_campaign_variables(trip, lead, urgency_level)

                # Render the template body with variables
                rendered_body = render_template_body(template, variables)

                # Queue the message
                message = OutboundMessage.objects.create(
                    lead=lead,
                    to=lead.phone,  # Use phone field instead of whatsapp_number
                    template=template,
                    rendered_body=rendered_body,
                    scheduled_for=timezone.now() + timedelta(minutes=5)  # Small delay to avoid spam
                )

                # Record message sent in analytics
                if campaign_analytics:
                    campaign_analytics.record_message_sent(lead)

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

        # Complete the campaign analytics
        if campaign_analytics:
            campaign_analytics.complete_campaign()
            logger.info(f"Campaign completed: {messages_queued} messages queued for {trip.name}")

        return messages_queued

    def get_qualified_leads_for_trip(self, trip, urgency_level):
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

        # Exclude leads who already booked this trip
        existing_bookings = trip.bookings.values_list('user__username', flat=True)
        base_queryset = base_queryset.exclude(phone__in=existing_bookings)

        # Filter by interest in similar destinations (based on metadata)
        interested_leads = []
        for lead in base_queryset[:200]:  # Limit for performance
            try:
                metadata = lead.metadata or {}

                # Check if lead has shown interest in this type of trip
                interested_trips = metadata.get('interested_trips', [])
                trip_keywords = [trip.name.lower(), trip.location.lower() if trip.location else '']

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

                # Urgency-based thresholds
                min_score = 30 if urgency_level == 'critical' else 50

                if score >= min_score:
                    interested_leads.append(lead)

            except Exception as e:
                logger.error(f"Error evaluating lead {lead.id}: {str(e)}")
                continue

        # Return top leads (limit to prevent spam)
        return interested_leads[:50]  # Max 50 messages per campaign

    def get_campaign_template_name(self, urgency_level):
        """
        Get appropriate template name based on urgency level
        """
        template_map = {
            'critical': 'campaign_critical_occupancy',
            'moderate': 'campaign_moderate_occupancy',
            'normal': 'campaign_normal_occupancy'
        }
        return template_map.get(urgency_level, 'campaign_normal_occupancy')

    def get_campaign_variables(self, trip, lead, urgency_level):
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
            'start_date': trip.start_date.strftime('%B %d, %Y') if trip.start_date else 'TBD',
            'urgency_level': urgency_level,
            'booking_deadline': (timezone.now() + timedelta(days=7)).strftime('%B %d') if urgency_level == 'critical' else 'Soon'
        }