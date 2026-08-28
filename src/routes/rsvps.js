import { Router } from 'express';
import { startSSE, patchSignals, patchElements } from '../middleware/datastar.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { eta } from '../eta.js';
import { findEventById } from '../db/queries/events.js';
import {
  setRsvpStatus,
  clearRsvpStatus,
  getUserRsvpsForEvents,
  listRsvpsForEvents,
  normalizeComment,
} from '../db/queries/eventRsvps.js';

export const rsvpsRouter = Router();

const SIGNAL_KEY_RE = /^e\d+$/;
const VALID_STATUSES = new Set(['attending', 'not_attending']);

rsvpsRouter.post('/rsvps/:eventId/:signalKey', requireAuth, async (req, res) => {
  const { eventId, signalKey } = req.params;
  const submitted = req.body?.rsvps?.[signalKey] ?? {};
  const status = submitted.status ?? '';
  const comment = normalizeComment(submitted.comment);

  if (!SIGNAL_KEY_RE.test(signalKey) || (status !== '' && !VALID_STATUSES.has(status))) {
    return res.status(400).send('Invalid RSVP request.');
  }

  const event = await findEventById(eventId);

  // Unknown or (meanwhile) cancelled event — nothing to RSVP to. Self-heal the
  // client's optimistic flip back to whatever's actually on record.
  if (!event || event.cancelled_at) {
    const current = await getUserRsvpsForEvents(req.user.id, [eventId]);
    const currentRsvp = current.get(eventId);
    const currentComment = currentRsvp?.comment ?? '';
    startSSE(res);
    patchSignals(res, {
      rsvps: {
        [signalKey]: { status: currentRsvp?.status ?? '', comment: currentComment, savedComment: currentComment, saved: false },
      },
    });
    return res.end();
  }

  if (status === '') {
    await clearRsvpStatus(eventId, req.user.id);
  } else {
    await setRsvpStatus(eventId, req.user.id, status, comment);
  }

  const rsvpsByEvent = await listRsvpsForEvents([eventId]);
  const { attending, notAttending } = rsvpsByEvent.get(eventId) ?? { attending: [], notAttending: [] };
  const attendeesHtml = eta.render('marketing/_rsvp-attendees', { event, attending, notAttending });

  const savedComment = comment ?? '';
  startSSE(res);
  patchSignals(res, {
    rsvps: { [signalKey]: { status, comment: savedComment, savedComment, saved: status !== '' } },
  });
  patchElements(res, attendeesHtml, { selector: `#rsvp-attendees-${eventId}`, mode: 'outer' });
  res.end();
});
