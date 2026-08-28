const DURATION_MINUTES = 150;
const RECURRENCE_RULE = 'RRULE:FREQ=MONTHLY;BYDAY=2WE';

function pad(n) {
  return String(n).padStart(2, '0');
}

// starts_at is a naive local wall-clock string ("YYYY-MM-DDTHH:mm") — build the
// Date from local components rather than parsing, so no implicit TZ conversion happens.
function parseLocalDateTime(startsAt) {
  const [datePart, timePart] = startsAt.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function compactDateTime(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function icsEscape(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function formatEventDateLabel(startsAt) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parseLocalDateTime(startsAt));
}

// Abbreviated weekday/month for narrow screens — see .upcoming-date-text-short.
export function formatEventDateLabelShort(startsAt) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parseLocalDateTime(startsAt));
}

export function formatEventTimeLabel(startsAt) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
    parseLocalDateTime(startsAt),
  );
}

function googleCalendarUrl(event, { recurring }) {
  const start = parseLocalDateTime(event.starts_at);
  const end = new Date(start.getTime() + DURATION_MINUTES * 60000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compactDateTime(start)}/${compactDateTime(end)}`,
    location: event.location,
  });
  if (recurring) params.set('recur', RECURRENCE_RULE);
  return `https://www.google.com/calendar/render?${params}`;
}

export function googleCalUrl(event) {
  return googleCalendarUrl(event, { recurring: false });
}

export function googleCalRecurUrl(event) {
  return googleCalendarUrl(event, { recurring: true });
}

function icsUri(event, { recurring }) {
  const start = parseLocalDateTime(event.starts_at);
  const end = new Date(start.getTime() + DURATION_MINUTES * 60000);
  const uid = recurring
    ? 'glass-meetup-recurring@glass-skeptics.org'
    : `glass-meetup-${compactDateTime(start)}@glass-skeptics.org`;

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'CALSCALE:GREGORIAN',
    'X-WR-TIMEZONE:America/New_York', 'PRODID:-//GLASS//GLASS Website//EN',
    'BEGIN:VEVENT',
    `DTSTART;TZID=America/New_York:${compactDateTime(start)}`,
    `DTEND;TZID=America/New_York:${compactDateTime(end)}`,
  ];
  if (recurring) lines.push(RECURRENCE_RULE);
  lines.push(
    `SUMMARY:${icsEscape(event.title)}`,
    `LOCATION:${icsEscape(event.location)}`,
    `UID:${uid}`,
    'END:VEVENT', 'END:VCALENDAR',
  );
  return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
}

export function icsDataUri(event) {
  return icsUri(event, { recurring: false });
}

export function icsRecurDataUri(event) {
  return icsUri(event, { recurring: true });
}
