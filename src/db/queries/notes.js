import { nanoid } from 'nanoid';
import { getDb } from '../client.js';

export async function createNote(body) {
  const id = nanoid();
  await getDb().execute({
    sql: 'INSERT INTO notes (id, body) VALUES (?, ?)',
    args: [id, body],
  });
  return id;
}

export async function listNotes() {
  const result = await getDb().execute('SELECT * FROM notes ORDER BY created_at DESC LIMIT 50');
  return result.rows;
}
