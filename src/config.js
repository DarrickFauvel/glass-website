import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
  sessionSecret: process.env.SESSION_SECRET || 'dev-only-insecure-secret',
  turso: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL,
  },
};
