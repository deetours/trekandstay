from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from core.models import Lead, Task
from core.services import enqueue_template_message

class Command(BaseCommand):
    help = 'Scan for recently abandoned booking interest and create re-engagement tasks/messages'

    def handle(self, *args, **options):
        now = timezone.now()
        cutoff = now - timezone.timedelta(minutes=20)
        created_tasks = 0
        # leads with recorded abandonment and still engaged
        leads = Lead.objects.filter(stage='engaged', metadata__last_abandoned_ts__isnull=False)[:1000]
        for lead in leads:
            try:
                last_abandoned_ts = lead.metadata.get('last_abandoned_ts')
                if not last_abandoned_ts:
                    continue
                # parse isoformat
                try:
                    from datetime import datetime
                    abandoned_time = datetime.fromisoformat(last_abandoned_ts.replace('Z','+00:00'))
                except Exception:
                    continue
                if abandoned_time > cutoff:
                    continue  # not yet eligible
                # avoid duplicate open tasks
                existing = Task.objects.filter(lead=lead, type='abandoned_reengage', status='open').first()
                if existing:
                    continue
                with transaction.atomic():
                    Task.objects.create(
                        lead=lead,
                        type='abandoned_reengage',
                        title='Re-engage abandoned booking',
                        due_at=now + timezone.timedelta(minutes=10)
                    )
                    phone = lead.phone or lead.metadata.get('phone') or ''
                    if phone:
                        enqueue_template_message(lead, phone, 'abandoned_followup', {
                            'first_name': (lead.name or 'Traveler').split(' ')[0],
                            'trip_name': lead.metadata.get('interest_trip','')
                        })
                    created_tasks += 1
            except Exception:
                continue
        self.stdout.write(self.style.SUCCESS(f'Created {created_tasks} abandoned tasks'))
