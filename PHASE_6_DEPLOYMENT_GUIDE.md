# Phase 6: Testing & Deployment Guide

## 🧪 Testing Phase

### 1. Test LLM Configuration

**Test endpoint availability:**
```bash
# From your backend directory
curl -X GET http://localhost:8000/api/whatsapp/models/
```

Expected response:
```json
{
  "available_models": {
    "kimi-k2": {
      "name": "Kimi K2",
      "temperature": 0.1,
      "max_tokens": 128,
      "purpose": "Classification & intent detection"
    },
    ...
  },
  "message": "Models are automatically selected based on task type"
}
```

### 2. Test Connection to Custom WhatsApp API

```bash
curl -X POST http://localhost:8000/api/whatsapp/test-connection/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"test_phone": "+919999999999"}'
```

Expected response:
```json
{
  "connection": "success",
  "result": {
    "success": true,
    "message_id": "msg_123",
    "status": "sent"
  },
  "configuration": {
    "api_url_configured": true,
    "api_key_configured": true,
    "rag_service_active": true,
    "llm_service_active": true
  }
}
```

### 3. Test Single Message Send

```bash
curl -X POST http://localhost:8000/api/whatsapp/send/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "919876543210",
    "message": "Hello! Testing WhatsApp integration 🚀",
    "type": "text"
  }'
```

### 4. Test AI-Generated Response

```bash
curl -X POST http://localhost:8000/api/whatsapp/ai-response/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "919876543210",
    "message": "What are the best treks in summer?",
    "user_data": {"name": "Raj", "preferences": "mountains"},
    "context": []
  }'
```

### 5. Test Personalized Campaign Message

```bash
curl -X POST http://localhost:8000/api/whatsapp/campaign/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contacts": [
      {"phone": "919876543210", "name": "Raj Kumar"},
      {"phone": "919876543211", "name": "Priya Singh"}
    ],
    "campaign_brief": "Hi {name}! 👋 Enjoy 30% off on {season} mountain treks. Limited time! 🎉",
    "personalize": true,
    "delay_seconds": 2
  }'
```

### 6. Test Booking Confirmation

```bash
curl -X POST http://localhost:8000/api/whatsapp/booking-confirmation/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "919876543210",
    "trip_name": "Hemkund Trek",
    "dates": "May 15-17, 2024",
    "traveler_count": 4,
    "total_price": 15999,
    "booking_id": "BK123456",
    "checkin_time": "10:00 AM"
  }'
```

### 7. Test Promotional Message

```bash
curl -X POST http://localhost:8000/api/whatsapp/promotional/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "919876543210",
    "title": "Summer Special",
    "description": "Enjoy 30% off on all mountain treks",
    "special_price": 13999,
    "regular_price": 19999,
    "expiry_date": "2024-05-31",
    "booking_link": "https://example.com/hemkund-trek"
  }'
```

### 8. Test Reminder Message

```bash
curl -X POST http://localhost:8000/api/whatsapp/reminder/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "919876543210",
    "type": "booking_upcoming",
    "data": {
      "trip_name": "Hemkund Trek",
      "days_left": 5,
      "support_link": "https://example.com/support"
    }
  }'
```

### 9. Test Bulk Send

```bash
curl -X POST http://localhost:8000/api/whatsapp/bulk-send/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phones": ["919876543210", "919876543211", "919876543212"],
    "message": "Check out our new trek! 🏔️",
    "delay_seconds": 1
  }'
```

## 🚀 Deployment Steps

### Step 1: Prepare Your VM

SSH into your Oracle Cloud VM:
```bash
ssh ubuntu@129.159.227.138
```

### Step 2: Update Environment Variables

```bash
# Navigate to backend directory
cd /path/to/backend

# Edit .env file
nano .env

# Update the following variables:
OPENROUTER_API_KEY=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
CUSTOM_WHATSAPP_API_URL=http://129.159.227.138:8000/api/whatsapp/
CUSTOM_WHATSAPP_API_KEY=<your_api_key>
WEBHOOK_SECRET_TOKEN=<generate_random_secure_token>
```

### Step 3: Install Dependencies

```bash
# Ensure Python 3.9+ is installed
python --version

# Install/upgrade requirements
pip install -r requirements.txt

# Install any missing packages
pip install requests django-cors-headers python-dotenv
```

### Step 4: Run Database Migrations

```bash
python manage.py migrate
```

### Step 5: Start Django Server

Option A - Development:
```bash
python manage.py runserver 0.0.0.0:8000
```

Option B - Production (using gunicorn):
```bash
pip install gunicorn
gunicorn travel_dashboard.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Step 6: Test Endpoints on VM

From your local machine:
```bash
# Test connection
curl -X GET http://129.159.227.138:8000/api/whatsapp/models/

# Should return available models
```

### Step 7: Deploy Frontend

Update frontend to point to VM:

In your `src/config/api.ts` or similar:
```typescript
const API_BASE = process.env.REACT_APP_API_URL || 'http://129.159.227.138:8000/api/';
```

Build and deploy:
```bash
npm run build
npm run preview
# Or deploy to Netlify
```

### Step 8: Setup Webhook Receiver

For incoming WhatsApp messages, your custom WhatsApp provider will POST to:
```
http://129.159.227.138:8000/api/whatsapp/webhook/
```

Make sure this URL is:
1. ✅ Publicly accessible
2. ✅ Firewall rules allow incoming requests
3. ✅ SSL certificate configured (for HTTPS)

### Step 9: Monitor Logs

On your VM:
```bash
# Watch Django logs in real-time
tail -f logs/django.log

# Or use Django's built-in logging
python manage.py runserver --verbosity 3
```

## 📊 Performance Monitoring

### Check RAG Service Health:
```bash
curl http://129.159.227.138:8000/api/whatsapp/models/
```

### Check Campaign Queue:
```bash
# View queued campaigns
curl http://129.159.227.138:8000/api/whatsapp/campaigns/status/
```

### View Conversation History:
```bash
curl "http://129.159.227.138:8000/api/whatsapp/conversation/?phone=919876543210" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 Security Checklist

- [ ] Change `CUSTOM_WHATSAPP_API_KEY` to production value
- [ ] Generate secure `WEBHOOK_SECRET_TOKEN`
- [ ] Enable HTTPS on VM (configure SSL certificate)
- [ ] Restrict API access with authentication tokens
- [ ] Set `DJANGO_DEBUG=False` in production
- [ ] Configure CORS for your frontend domain
- [ ] Setup rate limiting on API endpoints
- [ ] Enable logging and monitoring
- [ ] Regular backups of database
- [ ] Monitor OpenRouter API usage and costs

## 🐛 Troubleshooting

### Issue: "Connection refused" to WhatsApp API
**Solution:**
- Verify `CUSTOM_WHATSAPP_API_URL` is correct
- Check firewall rules allow outbound connections
- Test with curl: `curl -X GET http://YOUR_API_URL/health`

### Issue: "Invalid OpenRouter API key"
**Solution:**
- Verify key format: `sk-or-v1-...`
- Check key hasn't expired in OpenRouter dashboard
- Ensure key has proper permissions

### Issue: "Models not loading"
**Solution:**
- Check `OPENROUTER_API_KEY` is set
- Verify network connectivity to OpenRouter
- Check Django logs for error messages
- Restart Django server

### Issue: "Campaign not sending"
**Solution:**
- Verify contacts have valid phone numbers
- Check `CAMPAIGN_BATCH_DELAY_MS` isn't too short
- Verify WhatsApp API is responding
- Check error logs for specific failure reasons

## ✅ Deployment Verification

After deployment, verify:

1. **API Endpoints Accessible:**
   ```bash
   curl http://129.159.227.138:8000/api/whatsapp/models/
   ```

2. **Authentication Working:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://129.159.227.138:8000/api/whatsapp/send/ -X POST
   ```

3. **LLM Service Active:**
   - All 4 models configured
   - Task-based routing working
   - No API errors in logs

4. **WhatsApp Integration Ready:**
   - Custom API connection successful
   - Test message sends successfully
   - Webhooks receiving messages

5. **Frontend Integration:**
   - MarketingCampaignPage loads
   - Can create campaigns
   - Campaign results display correctly

## 🎉 Deployment Complete!

Your WhatsApp + Multi-Model LLM integration is now live! 

### What's Now Available:

✅ **AI-Powered Messaging:**
- 4-model LLM system (Kimi K2, MiniMax-M2, Grok, Qwen)
- Task-based model selection
- Personalized message generation

✅ **Campaign Management:**
- Bulk WhatsApp campaigns
- Automatic personalization per contact
- Campaign analytics and tracking

✅ **Transactional Messages:**
- Booking confirmations
- Promotional offers
- Smart reminders

✅ **Conversation Management:**
- Incoming message handling with AI responses
- Conversation caching and history
- User context awareness

✅ **Frontend Dashboard:**
- Campaign creation interface
- Analytics and performance tracking
- Contact management (CSV import)

### Next Steps:

1. **Monitor Performance:** Track API usage, response times, campaign metrics
2. **Optimize Costs:** Monitor OpenRouter API usage and adjust model selection if needed
3. **Gather Feedback:** Test with real users and refine campaigns based on results
4. **Scale Up:** Gradually increase campaign sizes and monitor system load
5. **Add Features:** Implement A/B testing, segment-based campaigns, scheduled messages

---

**Deployment Date:** $(date)
**Status:** ✅ LIVE & OPERATIONAL
**Support:** Check logs at `/backend/logs/` for troubleshooting
