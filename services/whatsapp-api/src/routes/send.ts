import { Router } from 'express';
import { handleSend } from '../helpers/sendMessage.js';

const router = Router();

router.post('/send', async (req, res, next) => {
  try {
    const result = await handleSend(req.body || {});
    res.json({ success: true, id: (result as any).id?._serialized || (result as any).id });
  } catch (err) { next(err); }
});

export default router;
