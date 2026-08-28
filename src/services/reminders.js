import { listEventsNeedingReminder, markReminderSent } from '../db/queries/events.js';
import { listReminderRecipientEmails } from '../db/queries/users.js';
import { sendEventReminderEmail } from './email.js';
import { formatEventDateLabel, formatEventTimeLabel } from '../lib/calendarLinks.js';
import { localDateTimeStringDaysFromNow } from '../lib/eventTime.js';
import { config } from '../config.js';

// Idempotent: an event's reminder_sent_at is set right after its send attempt, so
// a second run (next boot, next interval tick) skips anything already handled —
// safe to call as often as the caller likes.
export async function sendDueEventReminders() {
  const cutoff = localDateTimeStringDaysFromNow(config.reminderDaysBefore);
  const events = await listEventsNeedingReminder(cutoff);
  if (events.length === 0) return;

  const recipients = await listReminderRecipientEmails();
  for (const event of events) {
    if (recipients.length > 0) {
      await sendEventReminderEmail(
        recipients,
        event,
        formatEventDateLabel(event.starts_at),
        formatEventTimeLabel(event.starts_at),
      );
    }
    await markReminderSent(event.id);
  }
}
