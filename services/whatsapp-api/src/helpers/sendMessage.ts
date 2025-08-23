import { sendMessage } from '../services/whatsappClient.js';
import { assert } from '../utils/validatePayload.js';

export async function handleSend(body: any) {
  const { sessionId = 'primary', to, type = 'text' } = body;
  assert(to, 'Missing to');
  assert(type, 'Missing type');
  return sendMessage(sessionId, to, body);
}
