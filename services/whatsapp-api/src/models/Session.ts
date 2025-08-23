import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  status: 'initializing' | 'qr' | 'ready' | 'disconnected' | 'auth_failure';
  lastQRCode?: string; // base64 png
  serialized?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  lastConnectedAt?: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, index: true, required: true, unique: true },
  status: { type: String, required: true },
  lastQRCode: { type: String },
  serialized: { type: Schema.Types.Mixed },
  lastConnectedAt: { type: Date }
}, { timestamps: true });

export const SessionModel = mongoose.model<ISession>('Session', SessionSchema);
