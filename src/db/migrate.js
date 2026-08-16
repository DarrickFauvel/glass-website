import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CREATE TABLE IF NOT EXISTS in schema.sql only covers brand-new databases —
// columns added to an existing table need an explicit, idempotent ALTER here.
const COLUMN_ADDITIONS = [
  { table: 'users', column: 'privacy_consent_at', ddl: 'ALTER TABLE users ADD COLUMN privacy_consent_at TEXT' },
];

async function applyColumnAdditions() {
  const db = getDb();
  for (const { table, column, ddl } of COLUMN_ADDITIONS) {
    const { rows } = await db.execute(`PRAGMA table_info(${table})`);
    if (!rows.some((row) => row.name === column)) {
      await db.execute(ddl);
    }
  }
}

export async function migrate() {
  const sql = await readFile(path.join(__dirname, 'schema.sql'), 'utf-8');
  await getDb().executeMultiple(sql);
  await applyColumnAdditions();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => {
      console.log('Migration complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
