import { Router } from 'express';
import { listUpcomingEvents } from '../db/queries/events.js';
import { getUserRsvpsForEvents, listRsvpsForEvents } from '../db/queries/eventRsvps.js';
import {
  formatEventDateLabel,
  formatEventDateLabelShort,
  googleCalUrl,
  googleCalRecurUrl,
  icsDataUri,
  icsRecurDataUri,
} from '../lib/calendarLinks.js';

export const marketingRouter = Router();

marketingRouter.get('/', async (req, res) => {
  const events = await listUpcomingEvents(6);
  const eventIds = events.map((event) => event.id);

  // RSVP status/attendees are only fetched for logged-in visitors — most
  // homepage traffic is anonymous, so this avoids two extra queries per hit.
  let rsvpsByEvent = new Map();
  let rsvpSignalsJson = JSON.stringify({});
  if (req.user) {
    const [userRsvps, allRsvps] = await Promise.all([
      getUserRsvpsForEvents(req.user.id, eventIds),
      listRsvpsForEvents(eventIds),
    ]);
    rsvpsByEvent = allRsvps;
    const rsvps = {};
    events.forEach((event, i) => {
      const userRsvp = userRsvps.get(event.id);
      rsvps[`e${i}`] = { status: userRsvp?.status ?? '', comment: userRsvp?.comment ?? '', saved: false };
    });
    rsvpSignalsJson = JSON.stringify({ rsvps });
  }

  res.render('marketing/home', {
    events,
    rsvpsByEvent,
    rsvpSignalsJson,
    formatEventDateLabel,
    formatEventDateLabelShort,
    googleCalUrl,
    googleCalRecurUrl,
    icsDataUri,
    icsRecurDataUri,
  });
});

marketingRouter.get('/privacy', (req, res) => {
  res.render('legal/privacy');
});
