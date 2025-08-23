from django.core.management.base import BaseCommand
from core.models import MessageTemplate

TEMPLATES = [
    {
        'name': 'welcome_first_contact',
        'category': 'utility',
        'body': 'Hi {{first_name}}, thanks for reaching out about {{trip_name}}! We\'re here to help you plan. – Trek & Stay',
        'variables': ['first_name','trip_name']
    },
    {
        'name': 'abandoned_followup',
        'category': 'reminder',
        'body': 'Still interested in {{trip_name}}? Spots may fill soon. Reply here and we\'ll help you book. – Trek & Stay',
        'variables': ['trip_name']
    },
    {
        'name': 'payment_confirmation',
        'category': 'utility',
        'body': 'Hi {{first_name}}, we received advance ₹{{amount}} for {{trip_name}} (Booking #{{booking_id}}).',
        'variables': ['first_name','amount','trip_name','booking_id']
    },
]

class Command(BaseCommand):
    help = 'Seed required message templates if they do not exist.'

    def handle(self, *args, **options):
        created = 0
        for tpl in TEMPLATES:
            obj, was_created = MessageTemplate.objects.get_or_create(name=tpl['name'], defaults={
                'category': tpl['category'],
                'body': tpl['body'],
                'variables': tpl.get('variables', []),
                'active': True,
            })
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Seed complete. Created {created} templates.'))
