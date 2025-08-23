import express from 'express';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectMongo } from './config/mongo.js';
import { logger } from './config/logger.js';
import routes from './routes/index.js';
import { apiKeyAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter, sendLimiter } from './middleware/rateLimit.js';
import { securityMiddleware } from './middleware/security.js';

async function start() {
  await connectMongo();
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('tiny'));
  app.use(securityMiddleware);
  app.use(generalLimiter);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // All API endpoints require API key
  app.use(apiKeyAuth);

  // Add specific limiter for send
  app.use('/send', sendLimiter);

  app.use(routes);

  app.use(errorHandler);

  app.listen(config.port, () => {
    logger.info({ msg: 'WhatsApp API listening', port: config.port });
  });
}

start().catch(err => {
  logger.error({ msg: 'Fatal startup error', error: err.message });
  process.exit(1);
});
