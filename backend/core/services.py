from django.utils import timezone
from django.db import transaction
from .models import Lead, LeadEvent, MessageTemplate, OutboundMessage, Task
from typing import Optional
import logging

logger = logging.getLogger(__name__)

ALLOWED_TRANSITIONS = {
    'new': {'engaged', 'lost'},
    'engaged': {'awaiting_payment', 'lost'},
    'awaiting_payment': {'advance_paid', 'lost'},
    'advance_paid': {'balance_due', 'completed', 'lost'},
    'balance_due': {'completed', 'lost'},
    'completed': set(),
    'lost': set(),
}

def change_lead_stage(lead: Lead, new_stage: str, reason: str = '') -> bool:
    """Safely transition a lead stage and create an event. Returns True if changed."""
    if lead.stage == new_stage:
        return False
    allowed = ALLOWED_TRANSITIONS.get(lead.stage, set())
    if new_stage not in allowed and new_stage not in {'lost'}:  # allow any -> lost
        return False
    prev = lead.stage
    lead.stage = new_stage
    if new_stage == 'awaiting_payment' and not lead.next_action_at:
        lead.next_action_at = timezone.now() + timezone.timedelta(hours=6)
    lead.save(update_fields=['stage', 'next_action_at'])
    LeadEvent.objects.create(lead=lead, type='status_change', payload={'from': prev, 'to': new_stage, 'reason': reason})
    
    # Phase B automation: create initial follow-up task on first engage
    if prev == 'new' and new_stage == 'engaged':
        try:
            # avoid duplicates
            existing = Task.objects.filter(lead=lead, type='initial_contact', status='open').first()
            if not existing:
                Task.objects.create(
                    lead=lead,
                    type='initial_contact',
                    title='Reach out to new engaged lead',
                    due_at=timezone.now() + timezone.timedelta(minutes=30),
                )
        except Exception as e:
            logger.warning(f"Failed to create initial_contact task for lead {lead.id}: {e}")
    
    # WhatsApp automation based on stage changes
    if lead.whatsapp_number:
        whatsapp_stage_messages = {
            'interested': "Thanks for your interest! 🌟 I'll send you detailed information about our amazing travel packages shortly.",
            'qualified': "Great! You're all set. ✅ I'll prepare a custom quote tailored just for you.",
            'proposal_sent': "📋 I've sent you a detailed proposal with pricing and itinerary. Any questions or would you like to discuss anything?",
            'negotiating': "💬 I'm here to work out the perfect package for your dream trip. Let's find the best option!",
            'booking_confirmed': "🎉 Congratulations! Your booking is confirmed. Get ready for an amazing adventure! Trip details coming your way.",
            'payment_completed': "🙏 Thank you for your payment! Everything is set. Your adventure awaits - we can't wait to make it unforgettable!",
            'trip_completed': "✨ We hope you had an absolutely amazing trip! We'd love to hear about your experience. Please share your feedback when you have a moment.",
        }
        
        if new_stage in whatsapp_stage_messages:
            try:
                from .views import send_whatsapp_message  # Import here to avoid circular imports
                send_whatsapp_message(
                    lead.whatsapp_number,
                    whatsapp_stage_messages[new_stage],
                    session_id='sales'
                )
                # Log the automated message
                LeadEvent.objects.create(
                    lead=lead,
                    event_type='whatsapp_message_sent',
                    metadata={
                        'message': whatsapp_stage_messages[new_stage],
                        'trigger': f'stage_change_to_{new_stage}',
                        'automated': True,
                        'session_id': 'sales'
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to send WhatsApp stage change message to lead {lead.id}: {e}")
    
    # Mark stage transition task as complete if exists
    try:
        stage_tasks = Task.objects.filter(
            lead=lead,
            status__in=['open', 'pending'],
            metadata__contains={'target_stage': new_stage}
        )
        stage_tasks.update(status='completed')
    except Exception as e:
        logger.warning(f"Failed to complete stage tasks for lead {lead.id}: {e}")
    
    # Auto-complete initial tasks when moving beyond engaged
    if prev == 'engaged' and new_stage in {'awaiting_payment','advance_paid','balance_due','completed','lost'}:
        try:
            for t in Task.objects.filter(lead=lead, status='open', type='initial_contact')[:20]:
                t.mark_done()
        except Exception:
            pass
            
    return True

def render_template_body(template: MessageTemplate, variables: dict) -> str:
    body = template.body
    for k, v in variables.items():
        body = body.replace(f'{{{{{k}}}}}', str(v))
    return body

def enqueue_template_message(lead: Optional[Lead], to: str, template_name: str, variables: dict, schedule_at=None) -> Optional[OutboundMessage]:
    tpl = MessageTemplate.objects.filter(name=template_name, active=True).first()
    if not tpl:
        return None
    rendered = render_template_body(tpl, variables)
    return OutboundMessage.objects.create(lead=lead, to=to, template=tpl, rendered_body=rendered, scheduled_for=schedule_at)

def merge_leads(primary: Lead, secondary: Lead) -> bool:
    """Merge secondary into primary (retain primary). Returns True if merged, False if same."""
    if primary.id == secondary.id:
        return False
    changed = False
    # merge intent score
    try:
        primary.intent_score = min(255, (primary.intent_score or 0) + (secondary.intent_score or 0))
        changed = True
    except Exception:
        pass
    # merge metadata counters/events
    try:
        pmeta = primary.metadata or {}
        smeta = secondary.metadata or {}
        pc = (pmeta.get('counters') or {}).copy()
        sc = smeta.get('counters') or {}
        for k,v in sc.items():
            pc[k] = (pc.get(k) or 0) + v
        pmeta['counters'] = pc
        # combine events (trim last 50)
        pe = pmeta.get('events') or []
        se = smeta.get('events') or []
        combined = (pe + se)[-50:]
        pmeta['events'] = combined
        # carry first_touch earliest, last_touch latest
        ft_p = pmeta.get('first_touch')
        ft_s = smeta.get('first_touch')
        if ft_p and ft_s:
            pmeta['first_touch'] = ft_p if ft_p.get('ts','') <= ft_s.get('ts','') else ft_s
        elif ft_s and not ft_p:
            pmeta['first_touch'] = ft_s
        lt_p = pmeta.get('last_touch')
        lt_s = smeta.get('last_touch')
        if lt_s and (not lt_p or lt_s.get('ts','') > lt_p.get('ts','')):
            pmeta['last_touch'] = lt_s
        if smeta.get('interest_trip') and not pmeta.get('interest_trip'):
            pmeta['interest_trip'] = smeta.get('interest_trip')
        # mark merged ids
        merged_list = pmeta.get('merged_ids') or []
        merged_list.append(secondary.id)
        pmeta['merged_ids'] = list({*merged_list})
        primary.metadata = pmeta
        changed = True
    except Exception:
        pass
    # adopt trip if missing
    if not primary.trip_id and secondary.trip_id:
        primary.trip_id = secondary.trip_id
        changed = True
    if changed:
        primary.save(update_fields=['intent_score','metadata','trip','updated_at'])
    # reassign related objects (tasks, events, outbound messages)
    try:
        Task.objects.filter(lead=secondary).update(lead=primary)
        OutboundMessage.objects.filter(lead=secondary).update(lead=primary)
        LeadEvent.objects.filter(lead=secondary).update(lead=primary)
    except Exception:
        pass
    LeadEvent.objects.create(lead=primary, type='system', payload={'action':'merge','from_id': secondary.id})
    # soft-close secondary
    try:
        secondary.metadata = { **(secondary.metadata or {}), 'merged_into': primary.id }
        secondary.stage = 'lost'
        secondary.save(update_fields=['metadata','stage'])
    except Exception:
        pass
    return True

def run_abandoned_scan(now=None, cutoff_minutes: int = 20) -> int:
    """Core logic used by management command & API endpoint to create abandoned re-engage tasks.
    Returns number of tasks created."""
    from django.utils import timezone as tz
    now = now or tz.now()
    cutoff = now - tz.timedelta(minutes=cutoff_minutes)
    created_tasks = 0
    qs = Lead.objects.filter(stage='engaged', metadata__last_abandoned_ts__isnull=False)
    for lead in qs[:1000]:
        try:
            last_abandoned_ts = lead.metadata.get('last_abandoned_ts') if lead.metadata else None
            if not last_abandoned_ts:
                continue
            from datetime import datetime
            try:
                abandoned_time = datetime.fromisoformat(str(last_abandoned_ts).replace('Z','+00:00'))
            except Exception:
                continue
            if abandoned_time > cutoff:
                continue
            if Task.objects.filter(lead=lead, type='abandoned_reengage', status='open').exists():
                continue
            Task.objects.create(
                lead=lead,
                type='abandoned_reengage',
                title='Re-engage abandoned booking',
                due_at=now + tz.timedelta(minutes=10)
            )
            phone = lead.phone or (lead.metadata or {}).get('phone') or ''
            if phone:
                enqueue_template_message(lead, phone, 'abandoned_followup', {
                    'first_name': (lead.name or 'Traveler').split(' ')[0],
                    'trip_name': (lead.metadata or {}).get('interest_trip','')
                })
            created_tasks += 1
        except Exception:
            continue
    return created_tasks
