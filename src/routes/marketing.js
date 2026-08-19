import { Router } from 'express';
import { listUpcomingEvents } from '../db/queries/events.js';
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
  res.render('marketing/home', {
    events,
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
