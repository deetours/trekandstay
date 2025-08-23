import { Router } from 'express';
import { config } from '../config/env.js';

const router = Router();

// Optional endpoint for external services to POST test payloads; just echoes if token matches.
router.post('/webhook', (req, res) => {
  const token = req.header(config.webhookAuthHeader);
  if (token !== config.webhookAuthToken) return res.status(401).json({ error: 'Invalid token' });
  res.json({ received: true, payload: req.body });
});

export default router;
