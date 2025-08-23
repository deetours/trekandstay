import { SessionModel } from '../models/Session.js';
import { ISession } from '../models/Session.js';

export async function getOrCreate(sessionId: string): Promise<ISession> {
  let doc = await SessionModel.findOne({ sessionId });
  if (!doc) {
    doc = await SessionModel.create({ sessionId, status: 'initializing' });
  }
  return doc;
}

export async function updateSession(sessionId: string, update: Partial<ISession>) {
  await SessionModel.updateOne({ sessionId }, { $set: update });
}

export async function listSessions() {
  return SessionModel.find().lean();
}
