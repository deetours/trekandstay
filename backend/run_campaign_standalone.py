#!/usr/bin/env python
"""
Standalone campaign monitoring script
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_dashboard.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from core.management.commands.run_campaign_monitoring import Command

if __name__ == '__main__':
    # Run the command with dry-run
    cmd = Command()
    cmd.run_from_argv(['manage.py', 'run_campaign_monitoring', '--dry-run'])