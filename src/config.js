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
  smtp: {
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
  },
  contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL,
};
