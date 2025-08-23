# WhatsApp Integration with Your Travel Booking System

## 🔄 How It Works - Complete Flow

```
📱 Customer WhatsApp → WhatsApp API Service → Your Django Backend → Lead Management → Automated Responses
```

### **Flow Breakdown:**

1. **Inbound Messages**: Customer sends WhatsApp message → WhatsApp API captures it → Forwards to Django webhook
2. **Lead Creation**: Django processes message → Creates/updates Lead → Triggers automation workflows  
3. **Outbound Messages**: Django decides to send response → Calls WhatsApp API → Message delivered to customer
4. **Automation**: Based on lead stage/behavior → Automated follow-ups, booking reminders, payment notifications

---

## 🛠️ Integration Steps

### Step 1: Configure WhatsApp Webhook in Django

Add these endpoints to your Django `backend/core/views.py`:

```python
@api_view(['POST'])
@csrf_exempt
def whatsapp_incoming_webhook(request):
    """
    Receives incoming WhatsApp messages from WhatsApp API service
    """
    # Verify webhook token
    auth_token = request.headers.get('X-Webhook-Token')
    if auth_token != settings.WHATSAPP_WEBHOOK_SECRET:
        return Response({'error': 'Unauthorized'}, status=401)
    
    try:
        payload = request.data
        session_id = payload.get('sessionId')
        from_number = payload.get('from', '').replace('@c.us', '')
        message_body = payload.get('body', '')
        message_type = payload.get('type')
        timestamp = payload.get('timestamp')
        
        logger.info(f"WhatsApp message from {from_number}: {message_body}")
        
        # Create or get existing lead
        lead = create_or_update_lead_from_whatsapp(
            phone=from_number,
            message=message_body,
            session_id=session_id
        )
        
        # Process the message and trigger automation
        process_whatsapp_message(lead, message_body, message_type)
        
        return Response({'status': 'processed'})
        
    except Exception as e:
        logger.error(f"WhatsApp webhook error: {str(e)}")
        return Response({'error': 'Processing failed'}, status=500)


def create_or_update_lead_from_whatsapp(phone, message, session_id):
    """
    Create or update lead from WhatsApp interaction
    """
    # Try to find existing lead by phone
    lead = Lead.objects.filter(
        Q(phone=phone) | Q(whatsapp_number=phone)
    ).first()
    
    if not lead:
        # Create new lead
        lead = Lead.objects.create(
            phone=phone,
            whatsapp_number=phone,
            source='whatsapp',
            stage='inquiry',
            metadata={
                'first_message': message,
                'whatsapp_session': session_id,
                'contact_method': 'whatsapp'
            }
        )
        
        # Create welcome task
        Task.objects.create(
            lead=lead,
            type='initial_contact',
            status='pending',
            due_at=timezone.now() + timedelta(hours=1),
            description=f'Follow up on WhatsApp inquiry: "{message[:50]}..."'
        )
        
    else:
        # Update existing lead
        lead.metadata = lead.metadata or {}
        lead.metadata['last_whatsapp_message'] = message
        lead.metadata['last_contact'] = timezone.now().isoformat()
        lead.save()
    
    # Log the interaction
    LeadEvent.objects.create(
        lead=lead,
        event_type='whatsapp_message_received',
        metadata={
            'message': message,
            'session_id': session_id,
            'platform': 'whatsapp'
        }
    )
    
    return lead


def process_whatsapp_message(lead, message, message_type):
    """
    Analyze message and trigger appropriate responses
    """
    message_lower = message.lower()
    
    # Intent detection (simple keyword-based)
    if any(keyword in message_lower for keyword in ['book', 'booking', 'reserve']):
        # Booking intent
        send_whatsapp_message(
            lead.whatsapp_number,
            "Great! I'd love to help you with your booking. Which destination interests you?",
            session_id='customer_support'
        )
        lead.stage = 'interested'
        lead.save()
        
    elif any(keyword in message_lower for keyword in ['price', 'cost', 'how much']):
        # Pricing inquiry
        send_whatsapp_message(
            lead.whatsapp_number, 
            "I'll send you our latest pricing. What dates are you considering?",
            session_id='customer_support'
        )
        
    elif any(keyword in message_lower for keyword in ['help', 'support', 'question']):
        # Support request
        send_whatsapp_message(
            lead.whatsapp_number,
            "I'm here to help! What can I assist you with today?",
            session_id='customer_support'
        )
        
    else:
        # Generic acknowledgment
        if lead.stage == 'new':
            send_whatsapp_message(
                lead.whatsapp_number,
                "Thanks for reaching out! We specialize in amazing travel experiences. How can I help you today?",
                session_id='customer_support'
            )


@api_view(['POST'])
def send_whatsapp_message_endpoint(request):
    """
    Internal endpoint for sending WhatsApp messages
    """
    try:
        phone = request.data.get('phone')
        message = request.data.get('message')
        session_id = request.data.get('session_id', 'primary')
        message_type = request.data.get('type', 'text')
        
        result = send_whatsapp_message(phone, message, session_id, message_type)
        return Response({'success': True, 'result': result})
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


def send_whatsapp_message(phone, message, session_id='primary', message_type='text', **kwargs):
    """
    Send WhatsApp message via WhatsApp API service
    """
    import requests
    
    payload = {
        'sessionId': session_id,
        'to': phone,
        'type': message_type,
        'message': message,
        **kwargs
    }
    
    headers = {
        'X-API-Key': settings.WHATSAPP_API_KEY,
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(
            f"{settings.WHATSAPP_API_URL}/send",
            json=payload,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
        
    except requests.RequestException as e:
        logger.error(f"Failed to send WhatsApp message: {str(e)}")
        raise
```

### Step 2: Add Django Settings

Add to `backend/settings.py`:

```python
# WhatsApp API Integration
WHATSAPP_API_URL = 'http://localhost:4001'  # Or your deployed URL
WHATSAPP_API_KEY = 'your-secret-api-key'
WHATSAPP_WEBHOOK_SECRET = 'shared-webhook-secret'

# Webhook URL that WhatsApp service will call
WHATSAPP_WEBHOOK_URL = 'https://yourdomain.com/api/whatsapp/incoming'
```

### Step 3: Add URL Routing

Add to `backend/core/urls.py`:

```python
urlpatterns = [
    # ... existing URLs ...
    path('whatsapp/incoming/', whatsapp_incoming_webhook, name='whatsapp_webhook'),
    path('whatsapp/send/', send_whatsapp_message_endpoint, name='send_whatsapp'),
]
```

### Step 4: Configure WhatsApp API Service

Set these environment variables in `services/whatsapp-api/.env`:

```bash
PORT=4001
MONGO_URI=mongodb://localhost:27017/whatsapp
API_KEY=your-secret-api-key
WEBHOOK_TARGET_URL=https://yourdomain.com/api/whatsapp/incoming
WEBHOOK_AUTH_HEADER=X-Webhook-Token
WEBHOOK_AUTH_TOKEN=shared-webhook-secret
SESSION_DIR=./.wawsessions
ALLOW_ORIGINS=*
```

---

## 📋 Advanced Integration Examples

### 1. **Automated Booking Flow**

```python
def handle_booking_flow(lead, message):
    """
    Multi-step booking conversation
    """
    booking_state = lead.metadata.get('booking_state', 'start')
    
    if booking_state == 'start':
        send_whatsapp_message(
            lead.whatsapp_number,
            "🏔️ Which destination interests you?\n1. Himalayan Trek\n2. Beach Resort\n3. Desert Safari",
            message_type='buttons',
            buttons=[
                {'id': 'himalaya', 'text': 'Himalayan Trek'},
                {'id': 'beach', 'text': 'Beach Resort'},
                {'id': 'desert', 'text': 'Desert Safari'}
            ]
        )
        lead.metadata['booking_state'] = 'destination_selected'
        
    elif booking_state == 'destination_selected':
        # Process destination choice
        destination = message.lower()
        lead.metadata['preferred_destination'] = destination
        
        send_whatsapp_message(
            lead.whatsapp_number,
            f"Excellent choice! When would you like to travel for {destination}?",
        )
        lead.metadata['booking_state'] = 'dates_needed'
        
    elif booking_state == 'dates_needed':
        # Process dates and show pricing
        lead.metadata['preferred_dates'] = message
        
        send_whatsapp_message(
            lead.whatsapp_number,
            "Perfect! Let me send you pricing details and availability.",
        )
        
        # Send pricing image
        send_whatsapp_message(
            lead.whatsapp_number,
            "Here's our current pricing:",
            message_type='image',
            url='https://yourdomain.com/api/generate-pricing-image/',
            caption='Current pricing and packages'
        )
        
        lead.stage = 'qualified'
        lead.metadata['booking_state'] = 'pricing_sent'
    
    lead.save()
```

### 2. **Payment Reminders**

```python
def send_payment_reminder(booking):
    """
    Automated payment reminders via WhatsApp
    """
    if booking.payment_status == 'advance_pending':
        message = f"""
🔔 Payment Reminder
Booking: {booking.trip_name}
Amount Due: ${booking.advance_amount}
Due Date: {booking.advance_due_date.strftime('%B %d, %Y')}

Pay now: {booking.payment_link}
        """
        
        send_whatsapp_message(
            booking.customer_phone,
            message,
            session_id='payments'
        )
```

### 3. **Multi-Session Setup**

Different WhatsApp numbers for different purposes:

```python
WHATSAPP_SESSIONS = {
    'customer_support': {
        'number': '+1234567890',
        'purpose': 'General inquiries and support'
    },
    'sales': {
        'number': '+1234567891', 
        'purpose': 'Booking and sales conversations'
    },
    'payments': {
        'number': '+1234567892',
        'purpose': 'Payment reminders and confirmations'
    },
    'notifications': {
        'number': '+1234567893',
        'purpose': 'Trip updates and notifications'
    }
}
```

---

## 🎯 Lead Automation Integration

### Connect to Your Existing `change_lead_stage` Function:

```python
def change_lead_stage(lead, new_stage, reason=None):
    # ... existing logic ...
    
    # WhatsApp automation based on stage
    whatsapp_stage_messages = {
        'interested': "Thanks for your interest! I'll send you detailed information shortly.",
        'qualified': "Great! You're all set. I'll prepare a custom quote for you.",
        'proposal_sent': "I've sent you a detailed proposal. Any questions?",
        'negotiating': "I'm here to work out the perfect package for you.",
        'booking_confirmed': "🎉 Congratulations! Your booking is confirmed. Trip details coming up!",
        'payment_completed': "Thank you for your payment! Your adventure awaits.",
        'trip_completed': "Hope you had an amazing trip! We'd love your feedback."
    }
    
    if new_stage in whatsapp_stage_messages and lead.whatsapp_number:
        send_whatsapp_message(
            lead.whatsapp_number,
            whatsapp_stage_messages[new_stage],
            session_id='sales'
        )
    
    # ... rest of existing logic ...
```

### Enhanced Task Automation:

```python
def create_whatsapp_follow_up_task(lead, delay_hours=24):
    """
    Create WhatsApp follow-up tasks
    """
    Task.objects.create(
        lead=lead,
        type='whatsapp_follow_up',
        status='pending',
        due_at=timezone.now() + timedelta(hours=delay_hours),
        description=f'WhatsApp follow-up for {lead.name or lead.phone}',
        metadata={
            'action': 'send_whatsapp_message',
            'message_template': 'follow_up_template',
            'session_id': 'customer_support'
        }
    )
```

---

## 🚀 Testing the Integration

### 1. **Start Both Services:**

```bash
# Terminal 1: Start Django backend
cd backend
python manage.py runserver

# Terminal 2: Start WhatsApp API
cd services/whatsapp-api
docker compose up --build
```

### 2. **Set Up WhatsApp Session:**

```bash
# Create session and scan QR
curl -H "X-API-Key: your-secret-api-key" \
  "http://localhost:4001/create-session?sessionId=customer_support"
```

### 3. **Test Message Flow:**

1. Send WhatsApp message to your number
2. Check Django logs for webhook receipt
3. Verify lead creation in admin panel
4. Check automated response delivery

### 4. **Manual Testing:**

```bash
# Send test message from Django
curl -X POST http://localhost:8000/api/whatsapp/send/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "message": "Hello from your travel booking system!",
    "session_id": "customer_support"
  }'
```

---

## 🎯 Benefits of This Integration

✅ **Automated Lead Capture**: Every WhatsApp message creates/updates leads  
✅ **Real-time Engagement**: Instant responses to customer inquiries  
✅ **Multi-channel Tracking**: WhatsApp interactions tracked alongside web behavior  
✅ **Automated Workflows**: Stage-based messaging and follow-ups  
✅ **Rich Media**: Send images, documents, booking confirmations  
✅ **Scalable**: Multiple sessions for different business functions  

Your existing lead management system now becomes a powerful WhatsApp automation engine! 🚀
