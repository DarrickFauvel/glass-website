import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { listEvents, findEventById, createEvent, updateEvent } from '../db/queries/events.js';
import { ensureUpcomingRecurringMeetups } from '../services/eventMaintenance.js';
import { to24HourTime, from24HourTime } from '../lib/eventTime.js';

export const adminRouter = Router();

function formatStartsAt(startsAt) {
  const [date, time] = startsAt.split('T');
  return [date, from24HourTime(time)];
}

adminRouter.get('/admin/events', requireAdmin, async (req, res) => {
  await ensureUpcomingRecurringMeetups();
  const events = await listEvents();
  res.render('admin/events', { events, formatTime: formatStartsAt });
});

adminRouter.post('/admin/events', requireAdmin, async (req, res) => {
  const { title, date, hour, minute, ampm, location } = req.body.event ?? {};
  if (!title?.trim() || !date || !hour || !minute || !ampm || !location?.trim()) {
    return res.status(400).send('Title, date, time, and location are required.');
  }

  const startsAt = `${date}T${to24HourTime(hour, minute, ampm)}`;
  await createEvent({ title: title.trim(), startsAt, location: location.trim() });
  res.redirect('/admin/events');
});

adminRouter.get('/admin/events/:id/edit', requireAdmin, async (req, res) => {
  const event = await findEventById(req.params.id);
  if (!event) return res.status(404).send('Event not found.');

  const [date, time] = event.starts_at.split('T');
  const { hour, minute, ampm } = from24HourTime(time);
  res.render('admin/event-edit', { event, date, hour, minute, ampm });
});

adminRouter.post('/admin/events/:id', requireAdmin, async (req, res) => {
  const event = await findEventById(req.params.id);
  if (!event) return res.status(404).send('Event not found.');

  const { title, date, hour, minute, ampm, location, cancelled } = req.body.event ?? {};
  if (!title?.trim() || !date || !hour || !minute || !ampm || !location?.trim()) {
    return res.status(400).send('Title, date, time, and location are required.');
  }

  const startsAt = `${date}T${to24HourTime(hour, minute, ampm)}`;
  await updateEvent(req.params.id, {
    title: title.trim(),
    startsAt,
    location: location.trim(),
    cancelled: Boolean(cancelled),
  });
  res.redirect('/admin/events');
});
