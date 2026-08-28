CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0,
  is_admin INTEGER NOT NULL DEFAULT 0,
  privacy_consent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- A member can opt into any subset of the fixed offsets in
-- src/lib/reminderOffsets.js (0 rows = no reminders at all).
CREATE TABLE IF NOT EXISTS user_reminder_offsets (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offset_days INTEGER NOT NULL,
  PRIMARY KEY (user_id, offset_days)
);
CREATE INDEX IF NOT EXISTS idx_user_reminder_offsets_offset ON user_reminder_offsets(offset_days);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_evt_user_id ON email_verification_tokens(user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);

-- starts_at is stored as the naive local wall-clock string submitted by the
-- <input type="datetime-local"> admin form ("YYYY-MM-DDTHH:mm"), not a UTC
-- instant — there's no timezone handling elsewhere in the app, and this
-- avoids a local-to-UTC-and-back round trip when re-populating the edit form.
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  location TEXT NOT NULL,
  cancelled_at TEXT,
  is_recurring INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);

-- One row per (event, offset) reminder actually sent — an event can appear once
-- per distinct offset a member has opted into, not just once overall.
CREATE TABLE IF NOT EXISTS event_reminders_sent (
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  offset_days INTEGER NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (event_id, offset_days)
);
