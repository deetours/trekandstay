#!/usr/bin/env python
"""
Seed campaign message templates
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from core.models import MessageTemplate

TEMPLATES = [
    {
        'name': 'campaign_critical_occupancy',
        'category': 'marketing',
        'body': '''🚨 LIMITED TIME: Only {{spots_left}} spots left for {{trip_name}}!

Hi {{lead_name}}! 🌟

We're running a special promotion - {{discount_percent}} OFF on {{trip_name}} in {{trip_location}}!

🎯 Original Price: {{original_price}}
💰 Your Price: {{discounted_price}}

⏰ BOOK NOW - This deal expires {{booking_deadline}}!

Why wait? This adventure fills up fast! Reply "BOOK" or call us now.

- Trek & Stay Team 🏔️''',
        'variables': ['spots_left','trip_name','lead_name','discount_percent','trip_location','original_price','discounted_price','booking_deadline']
    },
    {
        'name': 'campaign_moderate_occupancy',
        'category': 'marketing',
        'body': '''🌟 Great News {{lead_name}}!

{{trip_name}} in {{trip_location}} has limited availability - only {{spots_left}} spots remaining!

💰 Special Price: {{discounted_price}} ({{discount_percent}} off!)

Don't miss this incredible adventure! Based on your interests, this trip would be perfect for you.

Reply "INTERESTED" to learn more or "BOOK" to reserve your spot!

- Trek & Stay Adventures 🏔️''',
        'variables': ['lead_name','trip_name','trip_location','spots_left','discounted_price','discount_percent']
    },
    {
        'name': 'campaign_normal_occupancy',
        'category': 'marketing',
        'body': '''Hi {{lead_name}}! 👋

We noticed you might be interested in adventures like {{trip_name}}.

🌟 {{spots_left}} spots still available
📍 Location: {{trip_location}}

This is a fantastic opportunity to explore! Would you like more details?

Reply "YES" for itinerary and booking info.

- Trek & Stay Team''',
        'variables': ['lead_name','trip_name','spots_left','trip_location']
    },
]

def seed_templates():
    created = 0
    for tpl in TEMPLATES:
        obj, was_created = MessageTemplate.objects.get_or_create(
            name=tpl['name'],
            defaults={
                'category': tpl['category'],
                'body': tpl['body'],
                'variables': tpl.get('variables', []),
                'active': True,
            }
        )
        if was_created:
            created += 1
            print(f"Created template: {tpl['name']}")
        else:
            print(f"Template already exists: {tpl['name']}")
    print(f"\nSeeding complete. Created {created} templates.")

if __name__ == '__main__':
    seed_templates()