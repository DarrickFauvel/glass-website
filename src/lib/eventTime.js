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
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
