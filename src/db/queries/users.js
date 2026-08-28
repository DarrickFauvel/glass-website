import { nanoid } from 'nanoid';
import { getDb } from '../client.js';

export async function createUser({ email, passwordHash, name, displayName, reminderOptIn = false, consentAt }) {
  const id = nanoid();
  await getDb().execute({
    sql: `INSERT INTO users (id, email, password_hash, name, display_name, reminder_opt_in, privacy_consent_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, email, passwordHash, name, displayName, reminderOptIn ? 1 : 0, consentAt ?? null],
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

export async function updateReminderOptIn(userId, optIn) {
  await getDb().execute({
    sql: 'UPDATE users SET reminder_opt_in = ? WHERE id = ?',
    args: [optIn ? 1 : 0, userId],
  });
}

export async function listReminderRecipientEmails() {
  const result = await getDb().execute(
    'SELECT email FROM users WHERE email_verified = 1 AND reminder_opt_in = 1',
  );
  return result.rows.map((row) => row.email);
}

// Explicit per-table deletes rather than relying on ON DELETE CASCADE —
// erasure must be guaranteed even if foreign_keys enforcement is ever off.
export async function deleteUser(userId) {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM sessions WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM email_verification_tokens WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM password_reset_tokens WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });
}
