import { listUpcomingActiveEvents } from '../db/queries/events.js';
import { listSentReminderKeys, markReminderSent } from '../db/queries/eventReminders.js';
import { listReminderRecipientEmails } from '../db/queries/reminderOffsets.js';
import { sendEventReminderEmail } from './email.js';
import { formatEventDateLabel, formatEventTimeLabel } from '../lib/calendarLinks.js';
import { daysUntilDate } from '../lib/eventTime.js';
import { REMINDER_OFFSET_OPTIONS } from '../lib/reminderOffsets.js';

// Idempotent: each (event, offset) pair is recorded in event_reminders_sent right
// after its send attempt, so a second run (next boot, next interval tick) skips
// anything already handled — safe to call as often as the caller likes. A member
// opted into multiple offsets (e.g. 7 days and 2 days) gets one email per offset
// as each becomes due, not just one reminder total.
export async function sendDueEventReminders() {
  const events = await listUpcomingActiveEvents();
  if (events.length === 0) return;

  const sentKeys = await listSentReminderKeys(events.map((event) => event.id));

  for (const event of events) {
    const daysUntil = daysUntilDate(event.starts_at);
    for (const { days: offsetDays } of REMINDER_OFFSET_OPTIONS) {
      if (daysUntil > offsetDays) continue; // not due yet
      if (sentKeys.has(`${event.id}:${offsetDays}`)) continue; // already sent

      const recipients = await listReminderRecipientEmails(offsetDays);
      if (recipients.length > 0) {
        await sendEventReminderEmail(
          recipients,
          event,
          formatEventDateLabel(event.starts_at),
          formatEventTimeLabel(event.starts_at),
        );
      }
      await markReminderSent(event.id, offsetDays);
    }
  }
}
