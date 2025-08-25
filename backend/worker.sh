#!/bin/bash
# Background worker script for Railway

echo "Starting background workers..."

while true; do
    echo "Processing outbound messages..."
    python manage.py process_outbound_messages --limit=50
    
    echo "Scanning for abandoned leads..."
    python manage.py scan_abandoned
    
    echo "Scheduling balance reminders..."
    python manage.py schedule_balance_reminder
    
    echo "Waiting 30 seconds before next cycle..."
    sleep 30
done
