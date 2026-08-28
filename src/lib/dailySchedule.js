// Runs `task` once a day at a fixed wall-clock time in `timeZone`, computing
// the delay to each next occurrence fresh (rather than a naive 24h interval)
// so the schedule stays correct across DST transitions.
export function scheduleDaily(hour, minute, timeZone, task) {
  const scheduleNext = () => {
    const delay = nextOccurrence(hour, minute, timeZone).getTime() - Date.now();
    setTimeout(async () => {
      try {
        await task();
      } catch (err) {
        console.error('Scheduled daily task failed:', err.message);
      }
      scheduleNext();
    }, delay);
  };
  scheduleNext();
}

function nextOccurrence(hour, minute, timeZone) {
  const now = new Date();
  const { year, month, day } = zonedDateParts(now, timeZone);
  let target = zonedTimeToUtc(year, month, day, hour, minute, timeZone);
  if (target <= now) {
    target = zonedTimeToUtc(year, month, day + 1, hour, minute, timeZone);
  }
  return target;
}

function zonedDateParts(date, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

// Finds the UTC instant corresponding to a given wall-clock time in `timeZone`,
// correcting for that zone's offset (including DST) on that specific date.
function zonedTimeToUtc(year, month, day, hour, minute, timeZone) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(new Date(utcGuess))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
  );
  return new Date(utcGuess + (utcGuess - asUtc));
}
