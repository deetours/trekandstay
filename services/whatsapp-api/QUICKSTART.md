# WhatsApp API - Quick Start Commands

# 1. Development Mode (with auto-reload)
npm run dev

# 2. Production Mode  
npm run build
npm start

# 3. Docker Development (recommended)
# Copy environment file first:
cp .env.example .env
# Edit .env with your settings, then:
docker compose up --build

# 4. Test the API (after service is running)
node test-api.js

# 5. Manual API Testing with curl:

# Health check (no auth required)
curl http://localhost:4001/health

# Create session (requires API key)
curl -H "X-API-Key: change-me" \
  "http://localhost:4001/create-session?sessionId=primary"

# Check session status
curl -H "X-API-Key: change-me" \
  "http://localhost:4001/session-status?sessionId=primary" 

# Send a text message (after QR scan)
curl -X POST \
  -H "X-API-Key: change-me" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "primary", "to": "1234567890", "type": "text", "message": "Hello from API!"}' \
  http://localhost:4001/send

# Send an image
curl -X POST \
  -H "X-API-Key: change-me" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "primary", "to": "1234567890", "type": "image", "url": "https://picsum.photos/300/200", "caption": "Random pic"}' \
  http://localhost:4001/send

# Environment Variables to Configure:
# - PORT=4001
# - MONGO_URI=mongodb://mongo:27017/whatsapp  
# - API_KEY=your-secret-key
# - WEBHOOK_TARGET_URL=https://your-app.com/api/whatsapp-webhook
# - WEBHOOK_AUTH_TOKEN=shared-secret-for-webhooks
