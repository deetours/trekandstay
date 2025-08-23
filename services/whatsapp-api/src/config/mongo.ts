import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

export async function connectMongo() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info({ msg: 'Mongo connected', uri: config.mongoUri });
  } catch (err) {
    logger.error({ msg: 'Mongo connection failed', error: (err as Error).message });
    process.exit(1);
  }
}
