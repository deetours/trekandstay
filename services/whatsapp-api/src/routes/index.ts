import { Router } from 'express';
import sessionRoutes from './session.js';
import sendRoutes from './send.js';
import webhookRoutes from './webhook.js';

const router = Router();

router.use(sessionRoutes);
router.use(sendRoutes);
router.use(webhookRoutes);

export default router;
