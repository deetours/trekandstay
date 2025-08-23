import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.header('X-API-Key');
  if (!key || key !== config.apiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}
