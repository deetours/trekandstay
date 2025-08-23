import { Router } from 'express';
import { initSession, getClient, logout } from '../services/whatsappClient.js';
import { SessionModel } from '../models/Session.js';

const router = Router();

router.get('/create-session', async (req, res, next) => {
  try {
    const sessionId = (req.query.sessionId as string) || 'primary';
    await initSession(sessionId);
    const doc = await SessionModel.findOne({ sessionId });
    res.json({ sessionId, status: doc?.status, qr: doc?.lastQRCode || null });
  } catch (err) { next(err); }
});

router.get('/session-status', async (req, res, next) => {
  try {
    const sessionId = (req.query.sessionId as string) || 'primary';
    const doc = await SessionModel.findOne({ sessionId });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const live = getClient(sessionId);
    res.json({ sessionId, status: doc.status, ready: !!live?.ready, lastConnectedAt: doc.lastConnectedAt });
  } catch (err) { next(err); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { sessionId = 'primary' } = req.body || {};
    await logout(sessionId);
    res.json({ sessionId, status: 'disconnected' });
  } catch (err) { next(err); }
});

export default router;
