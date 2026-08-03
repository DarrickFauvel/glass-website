import { nanoid } from 'nanoid';
import { getDb } from '../client.js';

export async function createUser({ email, passwordHash, displayName }) {
  const id = nanoid();
  await getDb().execute({
    sql: 'INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)',
    args: [id, email, passwordHash, displayName],
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
