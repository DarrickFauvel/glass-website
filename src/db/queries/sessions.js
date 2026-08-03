import { nanoid } from 'nanoid';
import { getDb } from '../client.js';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function createSession(userId) {
  const id = nanoid();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await getDb().execute({
    sql: 'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    args: [id, userId, expiresAt],
  });
  return id;
}

export async function findSessionWithUser(sessionId) {
  const result = await getDb().execute({
    sql: `SELECT sessions.expires_at AS session_expires_at, users.*
          FROM sessions JOIN users ON users.id = sessions.user_id
          WHERE sessions.id = ?`,
    args: [sessionId],
  });
  return result.rows[0] ?? null;
}

export async function deleteSession(sessionId) {
  await getDb().execute({
    sql: 'DELETE FROM sessions WHERE id = ?',
    args: [sessionId],
  });
}
