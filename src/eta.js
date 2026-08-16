import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Eta } from 'eta';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

export const eta = new Eta({
  views: path.join(rootDir, 'views'),
  cache: process.env.NODE_ENV === 'production',
});
