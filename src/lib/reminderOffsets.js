// The fixed set of reminder timings a member can opt into — kept small and fixed
// (rather than an arbitrary day count) so both the account-page checkboxes and the
// send logic stay simple. Add a new entry here to offer another timing everywhere.
export const REMINDER_OFFSET_OPTIONS = [
  { days: 7, label: '7 days before' },
  { days: 2, label: '2 days before' },
  { days: 1, label: '1 day before' },
  { days: 0, label: 'The day of the event' },
];

// What checking the single "email me reminders" box at signup opts a new member into.
// They can add or remove individual timings afterward from their account page.
export const DEFAULT_REMINDER_OFFSET_DAYS = 2;

export function isValidReminderOffset(days) {
  return REMINDER_OFFSET_OPTIONS.some((option) => option.days === days);
}
