import { Router } from 'express';
import { listUpcomingEvents } from '../db/queries/events.js';
import { getUserRsvpStatusesForEvents, listAttendeesForEvents } from '../db/queries/eventRsvps.js';
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
  let attendeesByEvent = new Map();
  let rsvpSignalsJson = JSON.stringify({});
  if (req.user) {
    const [userStatuses, attendees] = await Promise.all([
      getUserRsvpStatusesForEvents(req.user.id, eventIds),
      listAttendeesForEvents(eventIds),
    ]);
    attendeesByEvent = attendees;
    const rsvps = {};
    events.forEach((event, i) => {
      rsvps[`e${i}`] = userStatuses.get(event.id) ?? '';
    });
    rsvpSignalsJson = JSON.stringify({ rsvps });
  }

  res.render('marketing/home', {
    events,
    attendeesByEvent,
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
