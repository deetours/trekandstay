from django.core.management.base import BaseCommand
from core.models import Lead
from django.test import Client

class Command(BaseCommand):
    help = 'Simulate inbound custom WhatsApp message via API and show resulting lead + queued welcome'

    def add_arguments(self, parser):
        parser.add_argument('--phone', default='+911234567890')
        parser.add_argument('--text', default='Hi')

    def handle(self, *args, **opts):
        c = Client()
        resp = c.post('/api/custom-wa/inbound/', {'from': opts['phone'], 'text': opts['text']})
        self.stdout.write(f'Inbound response: {resp.status_code} {resp.json()}')
        lead = Lead.objects.get(id=resp.json()['lead_id'])
        self.stdout.write(f'Lead {lead.id} stage={lead.stage} last_contact_at={lead.last_contact_at}')
        self.stdout.write('Queued outbound messages:')
        for m in lead.outbound_messages.all():
            self.stdout.write(f'- {m.id} {m.status} {m.rendered_body[:60]}')
        self.stdout.write('Run process_outbound_messages to send them.')
