import { nanoid } from 'nanoid';
import { getDb } from '../client.js';

export async function createUser({ email, passwordHash, name, displayName, consentAt }) {
  const id = nanoid();
  await getDb().execute({
    sql: `INSERT INTO users (id, email, password_hash, name, display_name, privacy_consent_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, email, passwordHash, name, displayName, consentAt ?? null],
  });
  return id;
}

export async function findUserByEmail(email) {
  const result = await getDb().execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  return result.rows[0] ?? null;
}

export async function findUserById(id) {
  const result = await getDb().execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id],
  });
  return result.rows[0] ?? null;
}

export async function markEmailVerified(userId) {
  await getDb().execute({
    sql: 'UPDATE users SET email_verified = 1 WHERE id = ?',
    args: [userId],
  });
}

export async function markReminderConfirmed(userId) {
  await getDb().execute({
    sql: "UPDATE users SET reminder_confirmed_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?",
    args: [userId],
  });
}

export async function updatePassword(userId, passwordHash) {
  await getDb().execute({
    sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
    args: [passwordHash, userId],
  });
}

export async function updateName(userId, name) {
  await getDb().execute({
    sql: 'UPDATE users SET name = ? WHERE id = ?',
    args: [name, userId],
  });
}

export async function updateDisplayName(userId, displayName) {
  await getDb().execute({
    sql: 'UPDATE users SET display_name = ? WHERE id = ?',
    args: [displayName, userId],
  });
}

// Resets verification since we can't assume the account owner controls the new address yet.
export async function updateEmail(userId, email) {
  await getDb().execute({
    sql: 'UPDATE users SET email = ?, email_verified = 0 WHERE id = ?',
    args: [email, userId],
  });
}

// Explicit per-table deletes rather than relying on ON DELETE CASCADE —
// erasure must be guaranteed even if foreign_keys enforcement is ever off.
export async function deleteUser(userId) {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM sessions WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM email_verification_tokens WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM password_reset_tokens WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM reminder_confirmation_tokens WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM user_reminder_offsets WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });
}
