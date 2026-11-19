// Dev-only stand-in data for the homepage, picked with ?data=worst|empty|one.
// It replaces what the homepage route reads (events, RSVPs, claims, the
// visitor) at the route boundary, so the real templates and CSS render it.
// Nothing here is written anywhere: the event ids don't exist in the
// database, so the RSVP route turns any click into a no-op.
//
// The worst case is realistic, not random: names, venues and notes real
// members and organizers could plausibly enter. The schema has no length
// limit on display names or event locations; RSVP notes are capped at 280.

export const HOME_FIXTURES = ['worst', 'empty', 'one'];

const DEMO_USER = {
  id: 'demo-user',
  display_name: 'Aleksandra Wiśniewska-Kowalczyk',
  avatar_color: null,
  is_admin: 0,
};

function attendee(userId, displayName, extra = {}) {
  return { userId, displayName, isOrganizer: false, comment: null, avatarColor: null, ...extra };
}

// Three upcoming dates, each carrying different failures.
const WORST_EVENTS = [
  {
    id: 'demo-1',
    title: 'GLASS monthly meetup',
    starts_at: '2026-12-09T19:00',
    // An online meetup: the organizer pastes the whole Zoom link.
    location: 'Zoom — https://us06web.zoom.us/j/81234567890?pwd=bXlTZWNyZXRQYXNzd29yZEhhc2gxMjM0NTY3OA.1',
    cancelled_at: null,
    is_recurring: 1,
  },
  {
    id: 'demo-2',
    title: 'GLASS monthly meetup',
    starts_at: '2027-01-13T19:00',
    location: 'Billerica Public Library, Community Room B (lower level, use the side entrance) — 15 Concord Rd, Billerica, MA 01821',
    cancelled_at: '2026-11-19T10:00',
    is_recurring: 1,
  },
  {
    id: 'demo-3',
    title: 'GLASS monthly meetup',
    starts_at: '2027-02-10T19:00',
    // No " — " and no comma: the parsers have nothing to split on.
    location: 'TBD',
    cancelled_at: null,
    is_recurring: 1,
  },
];

const LONG_NOTE =
  "Running late from work in Burlington, probably 7:30. Bringing my partner and two friends from the Boston skeptics group, " +
  "first time for all of them! Here's the article I mentioned last month: " +
  'https://www.sciencebasedmedicine.org/the-placebo-effect-what-it-is-and-what-it-isnt-a-long-overdue-explainer/';

const WORST_ATTENDEES = [
  attendee('u1', 'Aleksandra Wiśniewska-Kowalczyk', { comment: LONG_NOTE.slice(0, 280) }),
  // People really do type their email or a handle as the display name.
  attendee('u2', 'bartholomew.fitzgerald@northwind-industries-holdings.example.com'),
  attendee('u3', 'Jo', { isOrganizer: true, comment: 'Grabbing the big table by the window' }),
  attendee('u4', '🦉 Night Owl'),
  attendee('u5', 'Robert Montgomery III'),
  attendee('u6', 'nguyễn thị minh khai'),
  ...Array.from({ length: 34 }, (_, i) => attendee(`u${i + 7}`, `Member ${i + 7}`)),
];

const WORST_CLAIMS = [
  {
    slug: 'demo-long-title',
    title: 'Is Electromagnetic Hypersensitivity From Wi-Fi Routers and 5G Towers Real?',
    summary:
      'Some people report headaches, fatigue and tingling near phones and routers, and the symptoms are real. ' +
      'Whether radio waves cause them is a separate question, and double-blind provocation studies have tested exactly that, ' +
      'dozens of times, in several countries, with the same result each time.',
    sourceCount: 1,
    picture: null,
  },
  {
    slug: 'demo-short',
    title: 'Ghosts?',
    summary: 'Short.',
    sourceCount: 0,
    picture: { src: '/images/claims/does-not-exist.jpg', alt: 'A picture that failed to load', position: '50% 50%' },
  },
  {
    slug: 'demo-third',
    title: 'Does Homeopathy Work Better Than Placebo for Anything at All?',
    summary: 'A remedy diluted past the last molecule. What the large reviews found, and why people still swear by it.',
    sourceCount: 1284,
    picture: null,
  },
];

/** @param {'worst'|'empty'|'one'} kind */
export function homeFixture(kind) {
  if (kind === 'empty') {
    return { events: [], rsvpsByEvent: new Map(), claims: [], user: DEMO_USER };
  }
  if (kind === 'one') {
    const event = { ...WORST_EVENTS[0], location: 'Panera Bread — 188 Boston Rd, Billerica, MA 01862' };
    return {
      events: [event],
      rsvpsByEvent: new Map([[event.id, { attending: [attendee('u1', 'Jo')], notAttending: [] }]]),
      claims: [{ ...WORST_CLAIMS[2], sourceCount: 1 }],
      user: DEMO_USER,
    };
  }
  return {
    events: WORST_EVENTS,
    rsvpsByEvent: new Map([
      ['demo-1', { attending: WORST_ATTENDEES, notAttending: [] }],
      ['demo-3', { attending: [], notAttending: [] }],
    ]),
    claims: WORST_CLAIMS,
    user: DEMO_USER,
  };
}
