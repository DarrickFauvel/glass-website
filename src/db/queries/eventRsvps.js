import { getDb } from '../client.js';

const VALID_STATUSES = new Set(['attending', 'not_attending']);
const COMMENT_MAX_LENGTH = 280;

export function normalizeComment(comment) {
  const trimmed = String(comment ?? '').trim();
  return trimmed ? trimmed.slice(0, COMMENT_MAX_LENGTH) : null;
}

export async function setRsvpStatus(eventId, userId, status, comment) {
  if (!VALID_STATUSES.has(status)) throw new Error(`Invalid RSVP status: ${status}`);
  await getDb().execute({
    sql: `INSERT INTO event_rsvps (event_id, user_id, status, comment, updated_at)
          VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
          ON CONFLICT(event_id, user_id)
          DO UPDATE SET status = excluded.status, comment = excluded.comment, updated_at = excluded.updated_at`,
    args: [eventId, userId, status, comment],
  });
}

export async function clearRsvpStatus(eventId, userId) {
  await getDb().execute({
    sql: 'DELETE FROM event_rsvps WHERE event_id = ? AND user_id = ?',
    args: [eventId, userId],
  });
}

// Map<eventId, { status: 'attending'|'not_attending', comment: string|null }>;
// an absent eventId means "no response".
export async function getUserRsvpsForEvents(userId, eventIds) {
  if (eventIds.length === 0) return new Map();
  const placeholders = eventIds.map(() => '?').join(',');
  const result = await getDb().execute({
    sql: `SELECT event_id, status, comment FROM event_rsvps WHERE user_id = ? AND event_id IN (${placeholders})`,
    args: [userId, ...eventIds],
  });
  return new Map(result.rows.map((row) => [row.event_id, { status: row.status, comment: row.comment }]));
}

// Map<eventId, { attending: Array<Rsvp>, notAttending: Array<Rsvp> }>, where
// Rsvp = { userId, displayName, isOrganizer, comment }. One batched query
// (avoids an N+1 query per rendered event). display_name is used deliberately:
// it's already documented (views/account/index.eta) as the public-facing name;
// `name` is private. Organizer status is users.is_admin — there's no separate
// organizer role in this app, admin doubles as organizer.
export async function listRsvpsForEvents(eventIds) {
  const empty = () => ({ attending: [], notAttending: [] });
  if (eventIds.length === 0) return new Map();
  const placeholders = eventIds.map(() => '?').join(',');
  const result = await getDb().execute({
    sql: `SELECT event_rsvps.event_id AS event_id, event_rsvps.status AS status, event_rsvps.comment AS comment,
                 users.id AS user_id, users.display_name AS display_name, users.is_admin AS is_admin,
                 users.avatar_color AS avatar_color
          FROM event_rsvps
          JOIN users ON users.id = event_rsvps.user_id
          WHERE event_rsvps.event_id IN (${placeholders})
          ORDER BY users.is_admin DESC, users.display_name COLLATE NOCASE ASC`,
    args: eventIds,
  });
  const byEvent = new Map();
  for (const row of result.rows) {
    if (!byEvent.has(row.event_id)) byEvent.set(row.event_id, empty());
    const entry = {
      userId: row.user_id,
      displayName: row.display_name,
      isOrganizer: Boolean(row.is_admin),
      comment: row.comment,
      avatarColor: row.avatar_color,
    };
    byEvent.get(row.event_id)[row.status === 'attending' ? 'attending' : 'notAttending'].push(entry);
  }
  return byEvent;
}
