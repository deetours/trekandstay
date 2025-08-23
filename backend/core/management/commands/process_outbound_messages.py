from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction, models
from core.models import OutboundMessage, LeadEvent, Lead
from core.services import enqueue_template_message

class Command(BaseCommand):
    help = "Process queued outbound messages (Phase 1 custom WA sandbox)"

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=50)

    def handle(self, *args, **options):
        limit = options['limit']
        now = timezone.now()
        processed = 0
        with transaction.atomic():
            # Schedule balance reminders placeholder: leads in advance_paid older than 1 day -> enqueue balance reminder
            older = timezone.now() - timezone.timedelta(days=1)
            for lead in Lead.objects.filter(stage='advance_paid', last_contact_at__lte=older)[:20]:
                enqueue_template_message(lead, lead.phone or lead.metadata.get('phone',''), 'balance_reminder', {
                    'first_name': (lead.name.split()[0] if lead.name else 'Traveler'),
                    'balance_amount': lead.metadata.get('balance_amount', ''),
                    'trip_name': lead.trip.name if getattr(lead, 'trip', None) else '',
                    'due_date': (timezone.now() + timezone.timedelta(days=2)).date(),
                    'payment_link': lead.metadata.get('payment_link','')
                })
            qs = OutboundMessage.objects.select_for_update().filter(status='queued').filter(models.Q(scheduled_for__lte=now) | models.Q(scheduled_for__isnull=True))[:limit]
            for msg in qs:
                msg.status = 'sending'
                msg.save(update_fields=['status'])
                try:
                    # Simulate send
                    msg.status = 'sent'
                    msg.sent_at = timezone.now()
                    msg.save(update_fields=['status', 'sent_at'])
                    if msg.lead:
                        LeadEvent.objects.create(lead=msg.lead, type='outbound_msg', payload={'body': msg.rendered_body})
                    processed += 1
                except Exception as e:
                    msg.status = 'failed'
                    msg.error = str(e)[:250]
                    msg.retries += 1
                    msg.save(update_fields=['status', 'error', 'retries'])
        self.stdout.write(self.style.SUCCESS(f"Processed {processed} messages"))
