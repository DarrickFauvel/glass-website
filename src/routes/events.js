import { Router } from 'express';
import { listAllUpcomingEvents, listPastEvents } from '../db/queries/events.js';
import { getUserRsvpsForEvents, listRsvpsForEvents } from '../db/queries/eventRsvps.js';
import { formatEventDateLabel, formatEventDateLabelShort, googleCalUrl, icsDataUri } from '../lib/calendarLinks.js';

export const eventsRouter = Router();

const PAST_PAGE_SIZE = 10;

eventsRouter.get('/events', async (req, res) => {
  const upcomingEvents = await listAllUpcomingEvents();

  let page = parseInt(req.query.page, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  const { events: pastEvents, hasOlder } = await listPastEvents({
    limit: PAST_PAGE_SIZE,
    offset: (page - 1) * PAST_PAGE_SIZE,
  });
  const hasNewer = page > 1;

  // Same privacy posture as the homepage: attendee names/comments (upcoming
  // or past) are only ever fetched/shown for logged-in visitors.
  let rsvpsByEvent = new Map();
  let rsvpSignalsJson = JSON.stringify({});
  if (req.user) {
    const allEventIds = [...upcomingEvents, ...pastEvents].map((event) => event.id);
    const [userRsvps, allRsvps] = await Promise.all([
      getUserRsvpsForEvents(req.user.id, upcomingEvents.map((event) => event.id)),
      listRsvpsForEvents(allEventIds),
    ]);
    rsvpsByEvent = allRsvps;
    const rsvps = {};
    upcomingEvents.forEach((event, i) => {
      const userRsvp = userRsvps.get(event.id);
      const comment = userRsvp?.comment ?? '';
      rsvps[`e${i}`] = {
        status: userRsvp?.status ?? '',
        comment,
        savedComment: comment,
        saved: false,
        noteOpen: Boolean(comment),
      };
    });
    rsvpSignalsJson = JSON.stringify({ rsvps });
  }

  res.render('events/index', {
    upcomingEvents,
    pastEvents,
    rsvpsByEvent,
    rsvpSignalsJson,
    page,
    hasOlder,
    hasNewer,
    formatEventDateLabel,
    formatEventDateLabelShort,
    googleCalUrl,
    icsDataUri,
  });
});
