import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CREATE TABLE IF NOT EXISTS in schema.sql only covers brand-new databases —
// columns added to an existing table need an explicit, idempotent ALTER here.
const COLUMN_ADDITIONS = [
  { table: 'users', column: 'privacy_consent_at', ddl: 'ALTER TABLE users ADD COLUMN privacy_consent_at TEXT' },
  {
    table: 'users',
    column: 'name',
    ddl: "ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ''",
    // Existing accounts never had a private name — seed it from their display name.
    backfill: "UPDATE users SET name = display_name WHERE name = ''",
  },
  {
    table: 'events',
    column: 'is_recurring',
    ddl: 'ALTER TABLE events ADD COLUMN is_recurring INTEGER NOT NULL DEFAULT 0',
  },
  {
    table: 'users',
    column: 'reminder_confirmed_at',
    ddl: 'ALTER TABLE users ADD COLUMN reminder_confirmed_at TEXT',
  },
  {
    table: 'event_rsvps',
    column: 'comment',
    ddl: 'ALTER TABLE event_rsvps ADD COLUMN comment TEXT',
  },
];

// Superseded by user_reminder_offsets / event_reminders_sent (multi-offset reminders) —
// migrates any existing single-preference data over, then drops the old columns.
const REMINDER_MIGRATION_DEFAULT_OFFSET_DAYS = 2;

async function applyColumnAdditions() {
  const db = getDb();
  for (const { table, column, ddl, backfill } of COLUMN_ADDITIONS) {
    const { rows } = await db.execute(`PRAGMA table_info(${table})`);
    if (!rows.some((row) => row.name === column)) {
      await db.execute(ddl);
      if (backfill) await db.execute(backfill);
    }
  }
}

async function migrateReminderPreferences() {
  const db = getDb();

  const { rows: userColumns } = await db.execute('PRAGMA table_info(users)');
  if (userColumns.some((row) => row.name === 'reminder_opt_in')) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO user_reminder_offsets (user_id, offset_days)
            SELECT id, ? FROM users WHERE reminder_opt_in = 1`,
      args: [REMINDER_MIGRATION_DEFAULT_OFFSET_DAYS],
    });
    await db.execute('ALTER TABLE users DROP COLUMN reminder_opt_in');
  }

  const { rows: eventColumns } = await db.execute('PRAGMA table_info(events)');
  if (eventColumns.some((row) => row.name === 'reminder_sent_at')) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO event_reminders_sent (event_id, offset_days)
            SELECT id, ? FROM events WHERE reminder_sent_at IS NOT NULL`,
      args: [REMINDER_MIGRATION_DEFAULT_OFFSET_DAYS],
    });
    await db.execute('ALTER TABLE events DROP COLUMN reminder_sent_at');
  }
}

export async function migrate() {
  const sql = await readFile(path.join(__dirname, 'schema.sql'), 'utf-8');
  await getDb().executeMultiple(sql);
  await applyColumnAdditions();
  await migrateReminderPreferences();
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
