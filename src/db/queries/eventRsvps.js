import { getDb } from '../client.js';

const VALID_STATUSES = new Set(['attending', 'not_attending']);

export async function setRsvpStatus(eventId, userId, status) {
  if (!VALID_STATUSES.has(status)) throw new Error(`Invalid RSVP status: ${status}`);
  await getDb().execute({
    sql: `INSERT INTO event_rsvps (event_id, user_id, status, updated_at)
          VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
          ON CONFLICT(event_id, user_id)
          DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
    args: [eventId, userId, status],
  });
}

export async function clearRsvpStatus(eventId, userId) {
  await getDb().execute({
    sql: 'DELETE FROM event_rsvps WHERE event_id = ? AND user_id = ?',
    args: [eventId, userId],
  });
}

// Map<eventId, 'attending'|'not_attending'>; an absent eventId means "no response".
export async function getUserRsvpStatusesForEvents(userId, eventIds) {
  if (eventIds.length === 0) return new Map();
  const placeholders = eventIds.map(() => '?').join(',');
  const result = await getDb().execute({
    sql: `SELECT event_id, status FROM event_rsvps WHERE user_id = ? AND event_id IN (${placeholders})`,
    args: [userId, ...eventIds],
  });
  return new Map(result.rows.map((row) => [row.event_id, row.status]));
}

// Map<eventId, Array<{ userId, displayName, isOrganizer }>> — attending only, one
// batched query (avoids an N+1 query per rendered event). display_name is used
// deliberately: it's already documented (views/account/index.eta) as the
// public-facing name; `name` is private. Organizer status is admins.is_admin —
// there's no separate organizer role in this app, admin doubles as organizer.
export async function listAttendeesForEvents(eventIds) {
  if (eventIds.length === 0) return new Map();
  const placeholders = eventIds.map(() => '?').join(',');
  const result = await getDb().execute({
    sql: `SELECT event_rsvps.event_id AS event_id, users.id AS user_id,
                 users.display_name AS display_name, users.is_admin AS is_admin
          FROM event_rsvps
          JOIN users ON users.id = event_rsvps.user_id
          WHERE event_rsvps.event_id IN (${placeholders}) AND event_rsvps.status = 'attending'
          ORDER BY users.is_admin DESC, users.display_name COLLATE NOCASE ASC`,
    args: eventIds,
  });
  const byEvent = new Map();
  for (const row of result.rows) {
    if (!byEvent.has(row.event_id)) byEvent.set(row.event_id, []);
    byEvent.get(row.event_id).push({
      userId: row.user_id,
      displayName: row.display_name,
      isOrganizer: Boolean(row.is_admin),
    });
  }
  return byEvent;
}
