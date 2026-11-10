# GLASS website specification

This describes how the site behaves today, as implemented on `main`. If this file and the code disagree, the code is right and this file should be fixed. Setup is in [`README.md`](README.md).

## Purpose

GLASS is a local science-based skeptics group in the Greater Lowell area. The site has three jobs:

1. Get people to in-person meetups.
2. Teach critical thinking through sourced, respectful content.
3. Keep members informed through RSVPs and email reminders.

Anyone can read the site without an account. An account is only needed to RSVP, see who is attending, and receive reminders.

## Content

All content is Markdown in `content/`, read from disk with no database. Merging a reviewed PR publishes it. All of it follows `content/WRITING_GUIDE.md`.

| Feature | URL | Source | Rules |
| --- | --- | --- | --- |
| Blog | `/blog`, `/blog/:slug` | `content/posts/YYYY-MM-DD-<slug>.md` | Newest first. A future-dated post stays hidden until that date in New York time. |
| Toolkit | `/toolkit` | `content/toolkit.md` | `##` groups and `###` entries with deep-linkable heading ids. Links to unpublished posts render as plain text. Entries can offer a hands-on exercise and a Scrimba explainer. |
| Quiz | `/toolkit/quiz` | `content/quiz.md` | Spot the Fallacy. A bad toolkit slug or missing explanation throws. Best score is kept in `localStorage`. |
| Skeptics | `/skeptics`, `/skeptics/:slug` | `content/skeptics/<slug>.md` | Oldest first by birth year. Needs valid toolkit slugs, at least 3 sources, and a `## Mistakes and criticism` section, or it throws. `drafts/` isn't loaded. |

The homepage shows the next 3 active meetups and the 6 newest posts. A broken post file must not take the homepage down, so those loaders log the error and fall back to empty.

## Events

- Events live in the database. Each has a title, a local start time, a location, and optional cancellation.
- **Recurring meetups are automatic.** The app keeps 6 future non-cancelled "GLASS In-Person Meetup" events scheduled, on the second Wednesday of the month at 7:00 PM at Panera Bread, 188 Boston Rd, Billerica. Cancelling one schedules a replacement further out.
- Admins can add one-off events and edit or cancel any event at `/admin/events`.
- Cancelled dates stay visible, struck through, with no calendar links.
- `/events` lists all upcoming events and past events, 10 per page.
- Each upcoming event has Google Calendar and `.ics` links.

### RSVPs

- A logged-in member can mark an upcoming event attending or not attending, add an optional comment, or clear their response.
- No row means no response, which is distinct from "not attending."
- Attendee names and comments are only shown to logged-in visitors, using display names. Admins are marked as organizers.

## Accounts

| Rule | Value |
| --- | --- |
| Registration requires | Name, display name, valid unique email, password of 8+ characters, privacy consent |
| Password hashing | argon2id |
| Session | Random id in a signed, `httpOnly`, `sameSite=lax` cookie (`secure` in production), stored server-side for 30 days |
| Verification and reminder-confirmation links | Valid for 24 hours |
| Password reset link | Valid for 1 hour, single use |
| Login failure message | Always "Invalid email or password." |

- Email verification is not required to log in or RSVP. It is required to receive reminders.
- On `/account`, members can change name, display name, avatar color, email and password; manage reminders; download their data; and delete the account. Changing email or deleting the account requires the password.
- Admin is the `users.is_admin` flag. There is no UI to grant it.

## Email

Transactional mail is sent over SMTP: address verification, password reset, reminder confirmation, and event reminders. The contact form doesn't use this path. It posts from the browser straight to Web3Forms.

### Event reminders

- Members choose any of 7, 2, 1 or 0 days before an event. The signup checkbox selects 2 days.
- Sending requires a verified email **and** a separate double opt-in confirmation. Confirmation is per account, not per timing.
- Due reminders are worked out by calendar date, so a late run still catches up.
- Each event and timing pair is sent once. It's recorded only if someone actually received it, so a member who confirms late can still get it.
- Changing an event's start time re-arms its reminders.
- Each send goes out as one message with recipients in BCC.

## Privacy and retention

The site treats EU and UK visitors as in scope.

- Consent is explicit at signup, timestamped, and reminders are off unless chosen.
- Account deletion removes the member's sessions, tokens, reminder choices, RSVPs and user row.
- Daily cleanup removes expired sessions and tokens, spent reset tokens, and accounts still unverified after 30 days.
- `/privacy` names the processors. It has not had legal review.

## Data model

Turso (libSQL). IDs are text and timestamps are ISO strings. The exception is `events.starts_at`, which is naive local time.

| Table | Purpose |
| --- | --- |
| `users` | Identity, password hash, verification, admin flag, consent time, reminder confirmation time, avatar color |
| `sessions` | Server-side login sessions |
| `email_verification_tokens`, `password_reset_tokens`, `reminder_confirmation_tokens` | Single-purpose expiring tokens |
| `user_reminder_offsets` | Which reminder timings each member chose |
| `events` | Meetups and one-off events |
| `event_reminders_sent` | One row per event and timing already sent |
| `event_rsvps` | One row per event and member: status and comment |

## Routes

| Access | Routes |
| --- | --- |
| Public pages | `GET /`, `/about`, `/privacy`, `/credits`, `/events`, `/blog`, `/blog/:slug`, `/toolkit`, `/toolkit/quiz`, `/skeptics`, `/skeptics/:slug`, `/healthz` |
| Auth | `GET`/`POST /register`, `/login`, `/forgot-password`, `/reset-password`; `GET /verify-email`, `/confirm-reminders` |
| Logged in | `POST /logout`, `POST /rsvps/:eventId/:signalKey`, `GET /account`, `GET /account/export`, `POST /account/*` |
| Admin | `GET`/`POST /admin/events`, `GET /admin/events/:id/edit`, `POST /admin/events/:id` |

## Background jobs

These run inside the web process with no external scheduler.

| Job | Runs |
| --- | --- |
| Schema migration | At boot |
| Data cleanup | At boot, then every 24 hours |
| Recurring meetup maintenance | At boot, every 24 hours, and on loading `/admin/events` |
| Event reminders | At boot, then daily at 9:00 AM New York time |

## Platform

- Hosted on Railway, running `pnpm start`. `/healthz` returns `ok`.
- Installable as a PWA. The service worker handles only precached assets and static paths (`/css/`, `/js/`, `/images/`, `/icons/`), so pages always come from the network.
- A failed migration at boot is logged and the server keeps running, so pages that don't query the database stay up without one. The homepage and `/events` do query it.
- `SCRIMBA_API_KEY` is used only when authoring explainers, not by the running app. `CONTACT_NOTIFY_EMAIL` is read into config but nothing uses it.

## Known gaps

- `/account/export` omits the member's RSVPs and comments.
- Cleanup deletes unverified `users` rows without first deleting their child rows, and no code enables foreign-key enforcement. If it's off on the database, those rows are orphaned.
- Unverified accounts can RSVP, so a display name from an unconfirmed address can appear on attendee lists.
