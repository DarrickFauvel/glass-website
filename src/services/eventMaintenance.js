import { listEvents, createEvent } from '../db/queries/events.js';
import { generateSecondWednesdayDateStrings } from '../lib/recurringEvents.js';
import { nowLocalDateTimeString } from '../lib/eventTime.js';

const TARGET_UPCOMING_COUNT = 6;
const RECURRING_TITLE = 'GLASS In-Person Meetup';
const RECURRING_TIME = '19:00';
const RECURRING_LOCATION = 'Panera Bread — 188 Boston Rd, Billerica, MA 01862';

// Keeps exactly TARGET_UPCOMING_COUNT non-cancelled future recurring meetups scheduled at
// all times — past dates naturally age out of that count, and cancelling one date backfills
// a new one further out, without needing a manual "generate" step.
export async function ensureUpcomingRecurringMeetups() {
  const allEvents = await listEvents();
  const recurring = allEvents.filter((event) => event.is_recurring);
  const nowString = nowLocalDateTimeString();

  const futureActiveCount = recurring.filter(
    (event) => !event.cancelled_at && event.starts_at >= nowString,
  ).length;
  const needed = TARGET_UPCOMING_COUNT - futureActiveCount;
  if (needed <= 0) return;

  const latestStartsAt = recurring.reduce((max, event) => (event.starts_at > max ? event.starts_at : max), '');
  const now = new Date();
  const [year, monthIndex] = latestStartsAt
    ? [Number(latestStartsAt.slice(0, 4)), Number(latestStartsAt.slice(5, 7))] // month is already the next 0-based month
    : [now.getFullYear(), now.getMonth()];

  const existingStartsAt = new Set(recurring.map((event) => event.starts_at));
  let created = 0;
  let offset = 0;
  while (created < needed) {
    const [dateString] = generateSecondWednesdayDateStrings(year, monthIndex + offset, 1);
    offset += 1;
    const startsAt = `${dateString}T${RECURRING_TIME}`;
    if (existingStartsAt.has(startsAt) || startsAt < nowString) continue;

    await createEvent({ title: RECURRING_TITLE, startsAt, location: RECURRING_LOCATION, isRecurring: true });
    existingStartsAt.add(startsAt);
    created += 1;
  }
}
