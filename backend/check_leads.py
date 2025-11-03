#!/usr/bin/env python
"""
Check qualified leads
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

leads = Lead.objects.filter(
    phone__isnull=False,
    phone__gt='',
    is_whatsapp=True,
    last_contact_at__gte=timezone.now() - timedelta(days=30),
    stage__in=['interested', 'qualified', 'engaged']
)

print(f'Found {leads.count()} qualified leads')
for lead in leads:
    print(f'  - {lead.name}: {lead.phone}, whatsapp={lead.is_whatsapp}, stage={lead.stage}, last_contact={lead.last_contact_at}')