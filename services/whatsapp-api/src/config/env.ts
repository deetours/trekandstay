import 'dotenv/config';

export interface AppConfig {
  port: number;
  mongoUri: string;
  apiKey: string;
  webhookTargetUrl?: string;
  webhookAuthHeader: string;
  webhookAuthToken: string;
  logLevel: string;
  sessionDir: string;
  allowOrigins: string[] | '*';
}

function parseOrigins(raw: string | undefined): string[] | '*' {
  if (!raw || raw === '*') return '*';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '4001', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/whatsapp',
  apiKey: process.env.API_KEY || 'change-me',
  webhookTargetUrl: process.env.WEBHOOK_TARGET_URL,
  webhookAuthHeader: process.env.WEBHOOK_AUTH_HEADER || 'X-Webhook-Token',
  webhookAuthToken: process.env.WEBHOOK_AUTH_TOKEN || 'shared-secret',
  logLevel: process.env.LOG_LEVEL || 'info',
  sessionDir: process.env.SESSION_DIR || './.wawsessions',
  allowOrigins: parseOrigins(process.env.ALLOW_ORIGINS)
};
