# 🚀 QUICK START GUIDE - WhatsApp + Multi-Model LLM

## ⚡ 5-Minute Setup

### Step 1: SSH to Your VM
```bash
ssh ubuntu@129.159.227.138
```

### Step 2: Update Backend Code
```bash
cd /path/to/backend
# Copy or git pull the new files:
# - services/rag_service.py
# - services/whatsapp_service.py
# - api/views/whatsapp_view.py
```

### Step 3: Update .env
```bash
nano /path/to/backend/.env

# Replace these lines:
OPENROUTER_API_KEY=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
CUSTOM_WHATSAPP_API_URL=http://129.159.227.138:8000/api/whatsapp/
CUSTOM_WHATSAPP_API_KEY=<your_custom_api_key>
```

### Step 4: Install & Run
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Step 5: Test
```bash
# From another terminal
curl http://129.159.227.138:8000/api/whatsapp/models/
```

**✅ You're Live!** 🎉

---

## 📋 What's Available

### API Endpoints Ready to Use

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `POST /whatsapp/send/` | Send text message | ✅ Required |
| `POST /whatsapp/ai-response/` | AI-powered reply | ✅ Required |
| `POST /whatsapp/campaign/` | Bulk personalized campaign | ✅ Required |
| `POST /whatsapp/booking-confirmation/` | Send confirmation | ✅ Required |
| `POST /whatsapp/promotional/` | Send promo offer | ✅ Required |
| `POST /whatsapp/reminder/` | Send reminder | ✅ Required |
| `GET /whatsapp/models/` | List LLM models | ✅ Required |
| `POST /whatsapp/webhook/` | Receive messages | ❌ Public |

### LLM Models Available

| Model | Purpose | Temp | Tokens |
|-------|---------|------|--------|
| Kimi K2 | Classification | 0.1 | 128 |
| MiniMax-M2 | Retrieval | 0.15 | 512 |
| Grok | Personalization | 0.4 | 1024 |
| Qwen | Content Writing | 0.2 | 2048 |

---

## 🧪 Quick Test Commands

### Test 1: Check Models
```bash
curl -X GET http://localhost:8000/api/whatsapp/models/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Send Message
```bash
curl -X POST http://localhost:8000/api/whatsapp/send/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "919876543210",
    "message": "Hello! 👋 Testing WhatsApp integration"
  }'
```

### Test 3: AI Response
```bash
curl -X POST http://localhost:8000/api/whatsapp/ai-response/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "919876543210",
    "message": "What treks do you recommend?",
    "user_data": {"name": "Raj"}
  }'
```

### Test 4: Campaign
```bash
curl -X POST http://localhost:8000/api/whatsapp/campaign/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [{"phone": "919876543210", "name": "Raj"}],
    "campaign_brief": "Hi {name}! 30% off trek. Book now! 🎉",
    "personalize": true,
    "delay_seconds": 2
  }'
```

---

## 🎯 Usage Patterns

### Pattern 1: Simple Broadcast (No Personalization)
```json
{
  "phone": "919876543210",
  "message": "New trek available! Check it out 🏔️"
}
→ Endpoint: POST /whatsapp/send/
→ Model Used: None (direct send)
```

### Pattern 2: AI Auto-Response
```json
{
  "phone": "919876543210",
  "message": "What's included in the trek?",
  "user_data": {"name": "Raj"}
}
→ Endpoint: POST /whatsapp/ai-response/
→ Models Used: Kimi K2 (classify) → MiniMax-M2 (respond) → Grok (personalize)
```

### Pattern 3: Personalized Campaign
```json
{
  "contacts": [
    {"phone": "919876543210", "name": "Raj", "interests": "mountains"},
    {"phone": "919876543211", "name": "Priya", "interests": "beaches"}
  ],
  "campaign_brief": "Hi {name}! New {interests} trek. 30% off! 🎉",
  "personalize": true
}
→ Endpoint: POST /whatsapp/campaign/
→ Models Used: Qwen (base) → Grok (personalize each) → Kimi K2 (polish)
→ Result: 2 unique personalized messages
```

### Pattern 4: Transactional Messages
```json
{
  "phone": "919876543210",
  "trip_name": "Hemkund Trek",
  "total_price": 15999
}
→ Endpoint: POST /whatsapp/booking-confirmation/
→ Model Used: None (pre-formatted)
```

---

## 📊 Dashboard Usage

### 1. Create Campaign
- Upload CSV (format: phone,name,email,interests)
- Write message with placeholders: "Hi {name}, try {interests}!"
- Toggle "Personalize" → Uses Grok for each contact
- Select delay (2 sec recommended)
- Click Send

### 2. Monitor Results
- Real-time sent/failed count
- Success rate percentage
- Failed contact list
- Each message customized per person

### 3. View Analytics
- Total campaigns sent
- Total contacts reached
- Average success rate
- Campaign performance chart

---

## 🔧 Common Configurations

### For Fast Delivery (Aggressive)
```env
CAMPAIGN_BATCH_DELAY_MS=500
CAMPAIGN_MAX_BATCH_SIZE=5000
```
⚠️ May trigger rate limiting

### For Reliability (Recommended)
```env
CAMPAIGN_BATCH_DELAY_MS=1000
CAMPAIGN_MAX_BATCH_SIZE=10000
```
✅ Balanced performance

### For Maximum Safety
```env
CAMPAIGN_BATCH_DELAY_MS=2000
CAMPAIGN_MAX_BATCH_SIZE=5000
```
✅ Slow but very reliable

---

## 🐛 Troubleshooting

### "Connection refused"
```bash
# Check if server is running
curl http://localhost:8000/health

# Check firewall
sudo ufw allow 8000
```

### "Invalid API key"
```bash
# Verify your key is correct in .env
cat /path/to/backend/.env | grep OPENROUTER

# Should be: sk-or-v1-...
```

### "Campaign not sending"
```bash
# Check phone numbers format
# Should be: 919876543210 or +919876543210

# Check logs
tail -f /path/to/backend/logs/django.log

# Verify custom WhatsApp API is up
curl -X GET YOUR_CUSTOM_API_URL/health
```

### "Models not loading"
```bash
# Verify all .py files are in place:
ls -la /backend/services/rag_service.py
ls -la /backend/services/whatsapp_service.py
ls -la /backend/api/views/whatsapp_view.py

# Restart Django
# Kill the process and restart:
python manage.py runserver 0.0.0.0:8000
```

---

## 📞 Getting Help

### Check Logs
```bash
# Django logs
tail -f /path/to/backend/logs/django.log

# Raw output
python manage.py runserver 0.0.0.0:8000 --verbosity 3
```

### Test Endpoint
```bash
# Detailed error info
curl -v http://localhost:8000/api/whatsapp/send/ \
  -H "Authorization: Bearer INVALID_TOKEN"
```

### Verify Setup
```bash
# All models loaded?
curl http://localhost:8000/api/whatsapp/models/

# API reachable?
curl -X HEAD http://129.159.227.138:8000/api/whatsapp/models/
```

---

## ✅ Deployment Checklist

Before going to production:

- [ ] Updated .env with correct API keys
- [ ] Tested endpoints with curl
- [ ] Verified phone number format
- [ ] Set `DJANGO_DEBUG=False` for production
- [ ] Configured SSL certificate
- [ ] Enabled HTTPS on VM
- [ ] Setup monitoring/logging
- [ ] Tested with small campaign (10 contacts)
- [ ] Verified WhatsApp messages are received
- [ ] Checked error logs for issues

---

## 📈 Performance Tips

### Optimize for Speed
1. Use `personalize=false` for bulk broadcasts
2. Set `delay_seconds=1` for faster sending
3. Increase `CAMPAIGN_MAX_BATCH_SIZE` to 20000
4. Run with multiple workers: `gunicorn --workers 8`

### Optimize for Reliability
1. Keep `personalize=true` for better engagement
2. Use `delay_seconds=2` for safety
3. Keep `CAMPAIGN_MAX_BATCH_SIZE=10000`
4. Monitor error rates and adjust

### Monitor API Costs
1. Check OpenRouter usage: https://openrouter.ai/usage
2. Prefer Kimi K2 (cheaper classification)
3. Use MiniMax-M2 for retrieval (cheaper)
4. Reserve Grok/Qwen for high-value messages

---

## 🎉 You're Ready!

Your system is now ready to:
✅ Send WhatsApp messages at scale
✅ Personalize each message with Grok LLM
✅ Auto-respond to incoming messages with RAG
✅ Generate marketing copy with Qwen
✅ Classify intents with Kimi K2
✅ Track campaigns and analytics

**Start with:** Test 1 command above, then create your first campaign! 🚀

---

**Last Updated:** $(date)
**Status:** ✅ PRODUCTION READY
**Support:** Check PHASE_6_DEPLOYMENT_GUIDE.md for detailed info
