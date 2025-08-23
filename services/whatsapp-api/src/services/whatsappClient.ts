import { Client, LocalAuth, Buttons, MessageMedia } from 'whatsapp-web.js';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
import * as sessionStore from './sessionStore.js';
import { qrToDataURL } from '../utils/qr.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface ManagedClient {
  client: Client;
  ready: boolean;
  initializing: boolean;
}

const clients: Record<string, ManagedClient> = {};

function sessionPath(id: string) {
  return path.join(config.sessionDir, id);
}

export async function initSession(sessionId: string) {
  if (clients[sessionId]) return clients[sessionId];
  fs.mkdirSync(config.sessionDir, { recursive: true });

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionId, dataPath: config.sessionDir }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  });

  const managed: ManagedClient = { client, ready: false, initializing: true };
  clients[sessionId] = managed;

  const sdoc = await sessionStore.getOrCreate(sessionId);
  await sessionStore.updateSession(sessionId, { status: 'initializing' });

  client.on('qr', async qr => {
    logger.info({ msg: 'QR received', sessionId });
    const dataUrl = await qrToDataURL(qr);
    await sessionStore.updateSession(sessionId, { status: 'qr', lastQRCode: dataUrl });
  });

  client.on('ready', async () => {
    managed.ready = true; managed.initializing = false;
    logger.info({ msg: 'Client ready', sessionId });
    await sessionStore.updateSession(sessionId, { status: 'ready', lastQRCode: undefined, lastConnectedAt: new Date() });
  });

  client.on('auth_failure', async msg => {
    logger.error({ msg: 'Auth failure', detail: msg, sessionId });
    await sessionStore.updateSession(sessionId, { status: 'auth_failure' });
  });

  client.on('disconnected', async reason => {
    logger.warn({ msg: 'Client disconnected', reason, sessionId });
    await sessionStore.updateSession(sessionId, { status: 'disconnected' });
    delete clients[sessionId];
  });

  client.on('message', async message => {
    logger.info({ msg: 'Inbound message', from: message.from, type: message.type, sessionId });
    if (config.webhookTargetUrl) {
      try {
        await axios.post(config.webhookTargetUrl, {
          sessionId,
          from: message.from,
          to: message.to,
          body: message.body,
          type: message.type,
          timestamp: message.timestamp,
          id: message.id.id
        }, {
          headers: { [config.webhookAuthHeader]: config.webhookAuthToken }
        });
      } catch (err) {
        logger.error({ msg: 'Failed forwarding webhook', error: (err as Error).message });
      }
    }
  });

  client.initialize().catch(err => {
    logger.error({ msg: 'Initialization failed', error: err.message });
  });

  return managed;
}

export function getClient(sessionId: string) {
  return clients[sessionId];
}

export async function logout(sessionId: string) {
  const managed = clients[sessionId];
  if (managed) {
    await managed.client.logout();
    await managed.client.destroy();
    delete clients[sessionId];
  }
  await sessionStore.updateSession(sessionId, { status: 'disconnected' });
}

export async function sendMessage(sessionId: string, to: string, payload: any) {
  const managed = clients[sessionId];
  if (!managed || !managed.ready) throw new Error('Session not ready');
  const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
  switch (payload.type) {
    case 'text':
      return managed.client.sendMessage(chatId, payload.message);
    case 'image': {
      const media = await MessageMedia.fromUrl(payload.url);
      return managed.client.sendMessage(chatId, media, { caption: payload.caption });
    }
    case 'document': {
      const media = await MessageMedia.fromUrl(payload.url, { unsafeMime: true });
      return managed.client.sendMessage(chatId, media, { sendMediaAsDocument: true });
    }
    case 'buttons': {
      const buttons = (payload.buttons || []).map((b: any) => ({ body: b.text, id: b.id }));
      const btn = new Buttons(payload.message, buttons, payload.title || '', payload.footer || '');
      return managed.client.sendMessage(chatId, btn);
    }
    default:
      throw new Error('Unsupported message type');
  }
}
