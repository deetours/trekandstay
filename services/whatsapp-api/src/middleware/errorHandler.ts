import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ msg: 'Unhandled error', error: err.message, stack: err.stack });
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
