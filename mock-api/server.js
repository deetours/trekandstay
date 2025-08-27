// Simple mock API server for local frontend development
// Run: node mock-api/server.js
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8000;

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch (e) { return s; }
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const method = req.method || 'GET';
  const pathname = parsed.pathname || '/';

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    console.log(`[mock-api] ${method} ${pathname}`);
    if (body) console.log('[mock-api] body:', body.slice(0, 1000));

    // Health check
    if (pathname === '/health' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // Accept any /api/* route and return a generic JSON success
    if (pathname.startsWith('/api')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const parsedBody = body ? safeJsonParse(body) : null;

      // Simple behavior: for analytics track, respond quickly; for whatsapp, echo message
      if (pathname === '/api/analytics/track') {
        res.end(JSON.stringify({ ok: true, message: 'analytics tracked (mock)' }));
        return;
      }

      if (pathname === '/api/whatsapp/send-message/') {
        res.end(JSON.stringify({ ok: true, message: 'whatsapp sent (mock)', payload: parsedBody }));
        return;
      }

      // Default mock response
      res.end(JSON.stringify({ ok: true, path: pathname, method, payload: parsedBody }));
      return;
    }

    // Not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
  });
});

server.listen(PORT, () => {
  console.log(`[mock-api] Listening on http://127.0.0.1:${PORT}`);
  console.log('[mock-api] Responds to: /api/analytics/track, /api/whatsapp/send-message/, and any /api/*');
});
