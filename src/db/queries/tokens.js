import { nanoid } from 'nanoid';
import { getDb } from '../client.js';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

export async function createVerificationToken(userId) {
  const token = nanoid();
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();
  await getDb().execute({
    sql: 'INSERT INTO email_verification_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
    args: [token, userId, expiresAt],
  });
  return token;
}

export async function consumeVerificationToken(token) {
  const result = await getDb().execute({
    sql: 'SELECT * FROM email_verification_tokens WHERE token = ?',
    args: [token],
  });
  const row = result.rows[0];
  if (!row) return null;
  await getDb().execute({
    sql: 'DELETE FROM email_verification_tokens WHERE token = ?',
    args: [token],
  });
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row;
}

export async function createPasswordResetToken(userId) {
  const token = nanoid();
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
  await getDb().execute({
    sql: 'INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
    args: [token, userId, expiresAt],
  });
  return token;
}

export async function findPasswordResetToken(token) {
  const result = await getDb().execute({
    sql: 'SELECT * FROM password_reset_tokens WHERE token = ?',
    args: [token],
  });
  return result.rows[0] ?? null;
}

export async function markPasswordResetTokenUsed(token) {
  await getDb().execute({
    sql: "UPDATE password_reset_tokens SET used_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE token = ?",
    args: [token],
  });
}

export async function createReminderConfirmationToken(userId) {
  const token = nanoid();
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();
  await getDb().execute({
    sql: 'INSERT INTO reminder_confirmation_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
    args: [token, userId, expiresAt],
  });
  return token;
}

export async function consumeReminderConfirmationToken(token) {
  const result = await getDb().execute({
    sql: 'SELECT * FROM reminder_confirmation_tokens WHERE token = ?',
    args: [token],
  });
  const row = result.rows[0];
  if (!row) return null;
  await getDb().execute({
    sql: 'DELETE FROM reminder_confirmation_tokens WHERE token = ?',
    args: [token],
  });
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row;
}
