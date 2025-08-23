# WhatsApp API Microservice

Production-ready WhatsApp session & messaging microservice using whatsapp-web.js.

## Features

- ✅ Scan QR to create/restore sessions (multi-session via `sessionId` query param)
- ✅ Send text, image, document & button messages
- ✅ Receive messages and forward to configured webhook URL
- ✅ Session persistence in MongoDB + on-disk (LocalAuth) for reliability
- ✅ REST endpoints with API key auth & rate limiting
- ✅ Security headers (Helmet), CORS, logging, structured errors
- ✅ Docker & docker-compose for local dev

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness probe |
| GET | `/create-session?sessionId=primary` | Initiate session (returns QR if needed) |
| GET | `/session-status?sessionId=primary` | Session state |
| POST | `/logout` | Body: `{ "sessionId": "primary" }` |
| POST | `/send` | Send message (see examples below) |
| POST | `/webhook` | (Optional) External service can POST test payload here |

**Authentication**: All endpoints except `/health` require `X-API-Key` header.

### Send Message Examples

**Text:**
```json
{
  "sessionId": "primary",
  "to": "1234567890",
  "type": "text",
  "message": "Hello World!"
}
```

**Image (by public URL):**
```json
{
  "sessionId": "primary", 
  "to": "1234567890",
  "type": "image",
  "url": "https://example.com/pic.jpg",
  "caption": "Check this out!"
}
```

**Document:**
```json
{
  "sessionId": "primary",
  "to": "1234567890", 
  "type": "document",
  "url": "https://example.com/file.pdf",
  "filename": "document.pdf"
}
```

**Buttons:**
```json
{
  "sessionId": "primary",
  "to": "1234567890",
  "type": "buttons", 
  "message": "Choose an option:",
  "buttons": [
    { "id": "opt_a", "text": "Option A" },
    { "id": "opt_b", "text": "Option B" }
  ]
}
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `4001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/whatsapp` |
| `API_KEY` | Required in `X-API-Key` header | `change-me` |
| `WEBHOOK_TARGET_URL` | URL to POST inbound messages to | (optional) |
| `WEBHOOK_AUTH_HEADER` | Header name for webhook auth | `X-Webhook-Token` |
| `WEBHOOK_AUTH_TOKEN` | Shared secret for webhook auth | `shared-secret` |
| `LOG_LEVEL` | Winston log level | `info` |
| `SESSION_DIR` | Directory for LocalAuth session data | `./.wawsessions` |
| `ALLOW_ORIGINS` | CORS origins (comma-separated or `*`) | `*` |

## Quick Start

1. **Clone and setup:**
```bash
cd services/whatsapp-api
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Run with Docker Compose:**
```bash
docker compose up --build
```

4. **Create a session:**
```bash
curl -H "X-API-Key: change-me" \
  "http://localhost:4001/create-session?sessionId=primary"
```

5. **Scan QR code** from the response and wait for status to become `ready`

6. **Send a message:**
```bash
curl -X POST \
  -H "X-API-Key: change-me" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "primary", "to": "1234567890", "type": "text", "message": "Hello!"}' \
  "http://localhost:4001/send"
```

## Integration with Your App

### Webhook Setup
Configure `WEBHOOK_TARGET_URL` to receive inbound messages:

```json
{
  "sessionId": "primary",
  "from": "1234567890@c.us", 
  "to": "your-whatsapp@c.us",
  "body": "User message text",
  "type": "chat",
  "timestamp": 1691234567,
  "id": "message_id_here"
}
```

### Multi-Session Support
Use different `sessionId` values to manage multiple WhatsApp accounts:
- `?sessionId=customer-support`
- `?sessionId=sales-team`
- `?sessionId=notifications`

## Development

**Local development:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
npm start  
```

## Production Notes

- Uses headless Chromium via whatsapp-web.js (resource intensive)
- Session data persists in MongoDB + local filesystem
- For scaling: consider session affinity or shared storage
- Ensure WhatsApp Business API compliance for production use
- Monitor memory/CPU usage, especially with multiple sessions

## Troubleshooting

**"Session not ready" errors:**
- Check session status: `GET /session-status?sessionId=primary`
- Re-scan QR if status is `qr` or `auth_failure`

**QR code not appearing:**
- Ensure MongoDB is accessible
- Check Docker container logs: `docker compose logs whatsapp-api`

**Rate limiting:**
- General API: 120 req/min
- Send endpoint: 30 req/min  
- Adjust in `src/middleware/rateLimit.ts`

## License
MIT
