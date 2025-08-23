import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env.js';

export const securityMiddleware = [
  helmet(),
  cors({
    origin: config.allowOrigins === '*' ? '*' : (origin, cb) => {
      if (!origin || (config.allowOrigins as string[]).includes(origin)) return cb(null, origin);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: false
  })
];
