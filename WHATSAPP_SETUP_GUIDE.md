# WhatsApp Integration Setup & Testing Guide

## 🚀 Complete Setup Process

### Step 1: Environment Configuration

**WhatsApp API Service (.env):**
```bash
cd services/whatsapp-api
cp .env.example .env
```

Edit `.env` with:
```bash
PORT=4001
MONGO_URI=mongodb://localhost:27017/whatsapp
API_KEY=travel-bot-secret-key-2024
WEBHOOK_TARGET_URL=http://localhost:8000/api/whatsapp/incoming/
WEBHOOK_AUTH_HEADER=X-Webhook-Token
WEBHOOK_AUTH_TOKEN=webhook-shared-secret-123
LOG_LEVEL=info
SESSION_DIR=./.wawsessions
ALLOW_ORIGINS=*
```

**Django Backend (.env):**
Add to your Django `.env` file:
```bash
WHATSAPP_API_URL=http://localhost:4001
WHATSAPP_API_KEY=travel-bot-secret-key-2024
WHATSAPP_WEBHOOK_SECRET=webhook-shared-secret-123
```

### Step 2: Start Services

**Terminal 1 - Django Backend:**
```bash
cd backend
python manage.py runserver 8000
```

**Terminal 2 - WhatsApp API:**
```bash
cd services/whatsapp-api
docker compose up --build
```

Wait for both services to show "ready" status.

### Step 3: Setup WhatsApp Sessions

**Create Customer Support Session:**
```bash
curl -H "X-API-Key: travel-bot-secret-key-2024" \
  "http://localhost:4001/create-session?sessionId=customer_support"
```

**Response:**
```json
{
  "sessionId": "customer_support",
  "status": "qr", 
  "qr": "data:image/png;base64,iVBOR..."
}
```

**Create Sales Session:**
```bash
curl -H "X-API-Key: travel-bot-secret-key-2024" \
  "http://localhost:4001/create-session?sessionId=sales"
```

### Step 4: Scan QR Codes

1. Copy the QR data URLs from the API responses
2. Open in browser or decode with QR scanner app
3. Scan with WhatsApp on your phone
4. Wait for "ready" status

**Check Session Status:**
```bash
curl -H "X-API-Key: travel-bot-secret-key-2024" \
  "http://localhost:4001/session-status?sessionId=customer_support"
```

Expected response when ready:
```json
{
  "sessionId": "customer_support",
  "status": "ready",
  "ready": true,
  "lastConnectedAt": "2025-08-13T..."
}
```

## 🧪 Testing the Integration

### Test 1: Incoming Message Flow

1. Send WhatsApp message to your business number: "Hi, I want to book a trip"
2. Check Django logs for webhook processing
3. Verify lead creation in Django admin
4. Confirm automated response was sent

**Expected Django Logs:**
```
INFO - WhatsApp message from 1234567890: Hi, I want to book a trip
INFO - Created new lead from WhatsApp: 123
INFO - WhatsApp message sent to 1234567890: Great! I'd love to help...
```

### Test 2: Manual Outbound Message

**Send via Django API:**
```bash
curl -X POST http://localhost:8000/api/whatsapp/send-message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_DJANGO_TOKEN" \
  -d '{
    "phone": "1234567890",
    "message": "Hello! Thanks for your interest in our travel packages. How can I help you today?",
    "session_id": "customer_support"
  }'
```

### Test 3: Lead Stage Automation

**Change Lead Stage (triggers automatic WhatsApp):**
```python
# In Django shell: python manage.py shell
from core.models import Lead
from core.services import change_lead_stage

lead = Lead.objects.filter(whatsapp_number__isnull=False).first()
change_lead_stage(lead, 'interested', 'Manual test')
# Should automatically send WhatsApp message
```

### Test 4: Rich Message Types

**Send Image:**
```bash
curl -X POST http://localhost:8000/api/whatsapp/send-message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_DJANGO_TOKEN" \
  -d '{
    "phone": "1234567890",
    "type": "image",
    "url": "https://picsum.photos/600/400",
    "caption": "Check out this amazing destination! 🏔️"
  }'
```

**Send Buttons:**
```bash
curl -H "X-API-Key: travel-bot-secret-key-2024" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4001/send \
  -d '{
    "sessionId": "customer_support",
    "to": "1234567890",
    "type": "buttons",
    "message": "What type of adventure interests you?",
    "buttons": [
      {"id": "mountain", "text": "🏔️ Mountain Adventures"},
      {"id": "beach", "text": "🏖️ Beach Getaways"},
      {"id": "cultural", "text": "🏛️ Cultural Tours"}
    ]
  }'
```

## 🎯 Integration Points with Your Lead System

### 1. **Automatic Lead Creation**
Every WhatsApp message creates or updates a lead:
- Phone number becomes lead identifier
- Message content stored in metadata
- Source automatically set to 'whatsapp'
- Initial tasks created for follow-up

### 2. **Stage-Based Automation**
Your existing `change_lead_stage()` now automatically:
- Sends contextual WhatsApp messages
- Logs outbound message events
- Completes related tasks

### 3. **Multi-Session Management**
Different WhatsApp numbers for different purposes:

| Session | Purpose | Auto-respond |
|---------|---------|-------------|
| `customer_support` | General inquiries | ✅ Yes |
| `sales` | Booking conversations | ✅ Yes |
| `payments` | Payment reminders | ❌ Manual |
| `notifications` | Trip updates | ❌ Manual |

### 4. **Enhanced Lead Events**
New event types tracked:
- `whatsapp_message_received`
- `whatsapp_message_sent`
- Automated vs manual message flags
- Session ID and message metadata

## 🔄 Workflow Examples

### Booking Flow Automation:
```
Customer: "I want to book a mountain trek"
↓ 
System: Creates lead → Stage: inquiry
↓
Auto-response: "Great! Which mountain destination interests you?"
↓
Customer: "Himalayan trek in Nepal" 
↓
Stage changed to: interested → Automated WhatsApp: "Thanks for your interest! I'll send details..."
↓
Staff sends pricing via admin → Stage: qualified → Auto WhatsApp: "Custom quote prepared..."
```

### Payment Reminder Flow:
```python
# Automated payment reminders (can be scheduled)
def send_payment_reminder(booking):
    if booking.payment_status == 'advance_pending':
        send_whatsapp_message(
            booking.customer_phone,
            f"🔔 Friendly reminder: Your booking payment is due in 24 hours.\n\n" +
            f"Trip: {booking.trip_name}\n" + 
            f"Amount: ${booking.advance_amount}\n" +
            f"Pay now: {booking.payment_link}",
            session_id='payments'
        )
```

## 🛠️ Admin Dashboard Integration

Your existing admin now shows:
- WhatsApp message events in lead timeline
- Task counts including WhatsApp follow-ups  
- Session status monitoring
- Automated vs manual message tracking

Access via:
- **Lead Management**: `http://localhost:3000/admin/leads`
- **Tasks View**: `http://localhost:3000/admin/tasks`
- **WhatsApp Status**: Django API endpoint `/api/whatsapp/sessions/`

## 🚨 Troubleshooting

**"Session not ready" errors:**
- Check session status endpoint
- Re-scan QR if status is 'qr' or 'auth_failure'
- Restart WhatsApp API if disconnected

**Messages not being received:**
- Verify webhook URL is accessible from WhatsApp API
- Check Django logs for webhook authentication
- Ensure WhatsApp API service can reach Django backend

**Automated responses not sending:**
- Verify lead has `whatsapp_number` field populated  
- Check Django settings for WhatsApp API configuration
- Review logs for WhatsApp API key authentication

**Rate limiting:**
- General API: 120 requests/minute
- Send endpoint: 30 requests/minute
- Adjust in `services/whatsapp-api/src/middleware/rateLimit.ts`

## 🎉 Success Indicators

✅ **WhatsApp messages create leads automatically**  
✅ **Stage changes trigger contextual auto-responses**  
✅ **Rich media (images, buttons) work correctly**  
✅ **Multi-session setup for different business functions**  
✅ **Event tracking integrates with existing lead timeline**  
✅ **Manual admin controls work alongside automation**

Your travel booking system now has powerful WhatsApp automation! 🚀📱
