import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Eta } from 'eta';
import { marketingRouter } from './routes/marketing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

export function createApp() {
  const app = express();

  const eta = new Eta({
    views: path.join(rootDir, 'views'),
    cache: process.env.NODE_ENV === 'production',
  });
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

  app.get('/healthz', (req, res) => {
    res.status(200).send('ok');
  });

  app.use(marketingRouter);

  return app;
}
