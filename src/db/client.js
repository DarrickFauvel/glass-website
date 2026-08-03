import { createClient } from '@libsql/client';
import { config } from '../config.js';

let client;

export function getDb() {
  if (!client) {
    if (!config.turso.url) {
      throw new Error('TURSO_DATABASE_URL is not set — cannot connect to the database.');
    }
    client = createClient({
      url: config.turso.url,
      authToken: config.turso.authToken,
    });
  }
  return client;
}
