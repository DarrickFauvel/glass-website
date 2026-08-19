const WEDNESDAY = 3;

function secondWednesday(year, monthIndex) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const offsetToFirstWednesday = (WEDNESDAY - firstOfMonth.getDay() + 7) % 7;
  const day = 1 + offsetToFirstWednesday + 7;
  return new Date(year, monthIndex, day);
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// monthIndex overflowing past 11 rolls into subsequent years — the Date
// constructor normalizes that for us, so no manual year-rollover handling.
export function generateSecondWednesdayDateStrings(year, monthIndex, count) {
  const dates = [];
  for (let i = 0; i < count; i++) {
    dates.push(toDateString(secondWednesday(year, monthIndex + i)));
  }
  return dates;
}
