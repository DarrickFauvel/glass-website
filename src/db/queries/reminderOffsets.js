import { getDb } from '../client.js';

export async function getUserReminderOffsets(userId) {
  const result = await getDb().execute({
    sql: 'SELECT offset_days FROM user_reminder_offsets WHERE user_id = ? ORDER BY offset_days DESC',
    args: [userId],
  });
  return result.rows.map((row) => row.offset_days);
}

// Replaces the member's full set of opted-in offsets with `offsetDaysList` in one go
// (simpler than diffing) — called with an empty array to opt out of reminders entirely.
export async function setUserReminderOffsets(userId, offsetDaysList) {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM user_reminder_offsets WHERE user_id = ?', args: [userId] });
  for (const offsetDays of offsetDaysList) {
    await db.execute({
      sql: 'INSERT INTO user_reminder_offsets (user_id, offset_days) VALUES (?, ?)',
      args: [userId, offsetDays],
    });
  }
}

// Verified members who want a reminder at this specific offset and have confirmed
// (double opt-in) they want reminder emails at all — selecting an offset alone
// isn't enough to receive anything until reminder_confirmed_at is set.
export async function listReminderRecipientEmails(offsetDays) {
  const result = await getDb().execute({
    sql: `SELECT users.email FROM users
          JOIN user_reminder_offsets ON user_reminder_offsets.user_id = users.id
          WHERE users.email_verified = 1 AND users.reminder_confirmed_at IS NOT NULL
            AND user_reminder_offsets.offset_days = ?`,
    args: [offsetDays],
  });
  return result.rows.map((row) => row.email);
}
