import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { eta } from './eta.js';
import { config } from './config.js';
import { migrate } from './db/migrate.js';
import { cleanupExpiredData } from './db/cleanup.js';
import { sessionMiddleware } from './middleware/session.js';
import { marketingRouter } from './routes/marketing.js';
import { authRouter } from './routes/auth.js';
import { accountRouter } from './routes/account.js';
import { devRouter } from './routes/dev.js';

const RETENTION_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

export function createApp() {
  const app = express();

  migrate()
    .then(() => cleanupExpiredData())
    .catch((err) => {
      console.error('Migration failed at boot (continuing anyway):', err.message);
    });
  setInterval(() => {
    cleanupExpiredData().catch((err) => console.error('Data retention cleanup failed:', err.message));
  }, RETENTION_CLEANUP_INTERVAL_MS);

  app.engine('eta', (filePath, data, callback) => {
    try {
      const relativePath = path.relative(eta.config.views, filePath).replace(/\.eta$/, '');
      const body = eta.render(relativePath, data);
      const rendered = eta.render('layout', { ...data, body });
      callback(null, rendered ?? '');
    } catch (err) {
      callback(err);
    }
  });
  app.set('view engine', 'eta');
  app.set('views', path.join(rootDir, 'views'));

  app.use(express.static(path.join(rootDir, 'public')));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(config.sessionSecret));
  app.use(sessionMiddleware);

  app.get('/healthz', (req, res) => {
    res.status(200).send('ok');
  });

  app.use(marketingRouter);
  app.use(authRouter);
  app.use(accountRouter);
  if (config.nodeEnv !== 'production') {
    app.use(devRouter);
  }

  return app;
}
