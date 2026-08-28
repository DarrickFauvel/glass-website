import { getDb } from '../client.js';

// One query for every (event, offset) pair already sent, across all candidate events,
// rather than a per-pair existence check — the reminder job holds the result in a Set.
export async function listSentReminderKeys(eventIds) {
  if (eventIds.length === 0) return new Set();
  const placeholders = eventIds.map(() => '?').join(',');
  const result = await getDb().execute({
    sql: `SELECT event_id, offset_days FROM event_reminders_sent WHERE event_id IN (${placeholders})`,
    args: eventIds,
  });
  return new Set(result.rows.map((row) => `${row.event_id}:${row.offset_days}`));
}

export async function markReminderSent(eventId, offsetDays) {
  await getDb().execute({
    sql: 'INSERT OR IGNORE INTO event_reminders_sent (event_id, offset_days) VALUES (?, ?)',
    args: [eventId, offsetDays],
  });
}

export async function clearRemindersSent(eventId) {
  await getDb().execute({ sql: 'DELETE FROM event_reminders_sent WHERE event_id = ?', args: [eventId] });
}
