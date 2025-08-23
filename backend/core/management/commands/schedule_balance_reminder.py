from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import Lead, OutboundMessage, MessageTemplate

class Command(BaseCommand):
    help = 'Force scheduling of balance reminder for leads in advance_paid stage (demo)'

    def add_arguments(self, parser):
        parser.add_argument('--minutes', type=int, default=1, help='Schedule reminder this many minutes from now')

    def handle(self, *args, **opts):
        tmpl = MessageTemplate.objects.filter(name='balance_reminder').first()
        if not tmpl:
            self.stdout.write(self.style.ERROR('balance_reminder template missing'))
            return
        count = 0
        for lead in Lead.objects.filter(stage='advance_paid')[:100]:
            if not OutboundMessage.objects.filter(lead=lead, template=tmpl, status__in=['queued','sent']).exists():
                body = tmpl.body.replace('{{first_name}}', (lead.name or 'Traveler'))
                body = body.replace('{{balance_amount}}', str(lead.metadata.get('balance_amount','')))
                body = body.replace('{{trip_name}}', lead.trip.name if lead.trip else '')
                body = body.replace('{{due_date}}', (lead.metadata.get('due_date') or 'soon'))
                body = body.replace('{{payment_link}}', lead.metadata.get('payment_link',''))
                OutboundMessage.objects.create(lead=lead, to=lead.phone or 'unknown', template=tmpl, rendered_body=body, scheduled_for=timezone.now()+timezone.timedelta(minutes=opts['minutes']))
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Scheduled {count} reminders'))
