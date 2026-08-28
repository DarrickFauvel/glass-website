import { nanoid } from 'nanoid';
import { getDb } from '../client.js';
import { nowLocalDateTimeString } from '../../lib/eventTime.js';
import { clearRemindersSent } from './eventReminders.js';

export async function listEvents() {
  const result = await getDb().execute('SELECT * FROM events ORDER BY starts_at ASC');
  return result.rows;
}

// Returns events from now onward, ordered by date, stopping once `targetActiveCount`
// non-cancelled events have been collected — so a cancelled date still shows up
// (marked cancelled) if it falls before that count is reached, instead of being hidden.
export async function listUpcomingEvents(targetActiveCount) {
  const result = await getDb().execute({
    sql: 'SELECT * FROM events WHERE starts_at >= ? ORDER BY starts_at ASC',
    args: [nowLocalDateTimeString()],
  });

  const events = [];
  let activeCount = 0;
  for (const event of result.rows) {
    if (activeCount >= targetActiveCount) break;
    events.push(event);
    if (!event.cancelled_at) activeCount += 1;
  }
  return events;
}

export async function findEventById(id) {
  const result = await getDb().execute({
    sql: 'SELECT * FROM events WHERE id = ?',
    args: [id],
  });
  return result.rows[0] ?? null;
}

// All non-cancelled events that haven't started yet — the reminder job evaluates
// every offset a member might be opted into against this set itself.
export async function listUpcomingActiveEvents() {
  const result = await getDb().execute({
    sql: 'SELECT * FROM events WHERE starts_at >= ? AND cancelled_at IS NULL ORDER BY starts_at ASC',
    args: [nowLocalDateTimeString()],
  });
  return result.rows;
}

export async function createEvent({ title, startsAt, location, isRecurring = false }) {
  const id = nanoid();
  await getDb().execute({
    sql: 'INSERT INTO events (id, title, starts_at, location, is_recurring) VALUES (?, ?, ?, ?, ?)',
    args: [id, title, startsAt, location, isRecurring ? 1 : 0],
  });
  return id;
}

// Editing an event's date re-arms all of its reminders (clears event_reminders_sent)
// unless the date is unchanged — a title/location-only edit leaves already-sent
// reminders alone.
export async function updateEvent(id, { title, startsAt, location, cancelled }) {
  const db = getDb();
  const existing = await db.execute({ sql: 'SELECT starts_at FROM events WHERE id = ?', args: [id] });
  const dateChanged = existing.rows[0]?.starts_at !== startsAt;

  await db.execute({
    sql: `UPDATE events SET title = ?, starts_at = ?, location = ?, cancelled_at = ? WHERE id = ?`,
    args: [title, startsAt, location, cancelled ? new Date().toISOString() : null, id],
  });
  if (dateChanged) await clearRemindersSent(id);
}
