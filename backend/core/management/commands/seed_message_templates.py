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
    {
        'name': 'lead_capture_followup',
        'category': 'followup',
        'body': 'Hi {{name}}! Based on your ₹{{budget_min}}-{{budget_max}} budget, we have {{trip_count}} trips that match your preferences. Our expert will call you soon! 🏔️',
        'variables': ['name','budget_min','budget_max','trip_count']
    },
    {
        'name': 'balance_reminder',
        'category': 'reminder',
        'body': 'Hi {{first_name}}, your balance payment of ₹{{balance_amount}} for {{trip_name}} is due by {{due_date}}. Pay now: {{payment_link}}',
        'variables': ['first_name','balance_amount','trip_name','due_date','payment_link']
    },
    {
        'name': 'campaign_critical_occupancy',
        'category': 'marketing',
        'body': '''🚨 LIMITED TIME: Only {{spots_left}} spots left for {{trip_name}}!

Hi {{lead_name}}! 🌟

We're running a special promotion - {{discount_percent}} OFF on {{trip_name}} in {{trip_location}}!

🎯 Original Price: {{original_price}}
💰 Your Price: {{discounted_price}}
📅 Starting: {{start_date}}

⏰ BOOK NOW - This deal expires {{booking_deadline}}!

Why wait? This adventure fills up fast! Reply "BOOK" or call us now.

- Trek & Stay Team 🏔️''',
        'variables': ['spots_left','trip_name','lead_name','discount_percent','trip_location','original_price','discounted_price','start_date','booking_deadline']
    },
    {
        'name': 'campaign_moderate_occupancy',
        'category': 'marketing',
        'body': '''🌟 Great News {{lead_name}}!

{{trip_name}} in {{trip_location}} has limited availability - only {{spots_left}} spots remaining!

💰 Special Price: {{discounted_price}} ({{discount_percent}} off!)
📅 Departure: {{start_date}}

Don't miss this incredible adventure! Based on your interests, this trip would be perfect for you.

Reply "INTERESTED" to learn more or "BOOK" to reserve your spot!

- Trek & Stay Adventures 🏔️''',
        'variables': ['lead_name','trip_name','trip_location','spots_left','discounted_price','discount_percent','start_date']
    },
    {
        'name': 'campaign_normal_occupancy',
        'category': 'marketing',
        'body': '''Hi {{lead_name}}! 👋

We noticed you might be interested in adventures like {{trip_name}}. 

🌟 {{spots_left}} spots still available
📍 Location: {{trip_location}}
📅 Starting: {{start_date}}
💰 Price: {{discounted_price}}

This is a fantastic opportunity to explore! Would you like more details?

Reply "YES" for itinerary and booking info.

- Trek & Stay Team''',
        'variables': ['lead_name','trip_name','spots_left','trip_location','start_date','discounted_price']
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
