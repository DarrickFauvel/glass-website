export function to24HourTime(hour12, minute, ampm) {
  const hour24 = (Number(hour12) % 12) + (ampm === 'PM' ? 12 : 0);
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function from24HourTime(hhmm) {
  const [hourStr, minuteStr] = String(hhmm ?? '').split(':');
  const hour24 = Number(hourStr);
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return { hour: String(hour12), minute: minuteStr ?? '00', ampm };
}

// Matches the naive local "YYYY-MM-DDTHH:mm" format events.starts_at is stored in,
// so it can be compared against starts_at directly with string ordering.
export function nowLocalDateTimeString() {
  return localDateTimeStringFromDate(new Date());
}

// Whole calendar days between today and an event's date, ignoring time-of-day —
// e.g. an event later today is 0, tomorrow is 1, even though a full 24h hasn't
// elapsed. Used to decide which reminder offsets (7/2/0 days) are due for an event.
export function daysUntilDate(startsAt) {
  const [datePart] = startsAt.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const eventDate = new Date(year, month - 1, day);
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((eventDate - todayDate) / (24 * 60 * 60 * 1000));
}

function localDateTimeStringFromDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
