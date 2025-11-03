#!/usr/bin/env python
"""
Create test leads for campaign testing
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from core.models import Lead
from django.utils import timezone
from datetime import timedelta

TEST_LEADS = [
    {
        'name': 'Rajesh Kumar',
        'phone': '+919876543210',
        'email': 'rajesh@example.com',
        'stage': 'interested',
        'source': 'whatsapp',
        'is_whatsapp': True,
        'metadata': {
            'interested_trips': ['Maharashtra', 'Waterfall', 'Trek'],
            'budget_range': [5000, 15000],
            'preferred_dates': {'flexible': True}
        }
    },
    {
        'name': 'Priya Sharma',
        'phone': '+919876543211',
        'email': 'priya@example.com',
        'stage': 'engaged',
        'source': 'whatsapp',
        'is_whatsapp': True,
        'metadata': {
            'interested_trips': ['Kedarnath', 'Spiritual', 'Adventure'],
            'budget_range': [10000, 25000],
            'preferred_dates': {'startDate': '2024-12-01'}
        }
    },
    {
        'name': 'Amit Patel',
        'phone': '+919876543212',
        'email': 'amit@example.com',
        'stage': 'qualified',
        'source': 'web',
        'is_whatsapp': False,  # Not WhatsApp
        'metadata': {
            'interested_trips': ['Himachal', 'Adventure'],
            'budget_range': [8000, 20000]
        }
    },
    {
        'name': 'Sneha Reddy',
        'phone': '+919876543213',
        'email': 'sneha@example.com',
        'stage': 'interested',
        'source': 'whatsapp',
        'is_whatsapp': True,
        'metadata': {
            'interested_trips': ['Dudhsagar', 'Trek', 'Waterfall'],
            'budget_range': [6000, 12000]
        }
    }
]

def create_test_leads():
    created = 0
    for lead_data in TEST_LEADS:
        lead, was_created = Lead.objects.get_or_create(
            phone=lead_data['phone'],
            defaults={
                'name': lead_data['name'],
                'email': lead_data['email'],
                'stage': lead_data['stage'],
                'source': lead_data['source'],
                'is_whatsapp': lead_data['is_whatsapp'],
                'metadata': lead_data['metadata'],
                'last_contact_at': timezone.now() - timedelta(days=7)  # Recent contact
            }
        )
        if was_created:
            created += 1
            print(f"Created lead: {lead.name} ({lead.phone})")
        else:
            print(f"Lead already exists: {lead.name} ({lead.phone})")
    
    print(f"\nCreated {created} test leads.")

if __name__ == '__main__':
    create_test_leads()