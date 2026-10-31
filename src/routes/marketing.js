import { Router } from 'express';
import { listUpcomingEvents } from '../db/queries/events.js';
import { getUserRsvpsForEvents, listRsvpsForEvents } from '../db/queries/eventRsvps.js';
import {
  formatEventDateLabel,
  formatEventDateLabelShort,
  formatEventTimeLabel,
  googleCalUrl,
  googleCalRecurUrl,
  icsDataUri,
  icsRecurDataUri,
} from '../lib/calendarLinks.js';
import { listPosts } from '../lib/posts.js';

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

  res.render('marketing/home', {
    clueArticlesJson: await clueArticlesJson(),
    events,
    nextEvent: events.find((event) => !event.cancelled_at) ?? null,
    formatEventTimeLabel,
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

// Topic → published post, for linking the hero "secrets" modals to their
// articles. A broken post file shouldn't take the homepage down with it.
async function clueArticlesJson() {
  try {
    const posts = await listPosts();
    const byTopic = {};
    posts.forEach((post) => {
      // listPosts is newest-first, so the first post per topic wins.
      if (post.topic && !byTopic[post.topic]) byTopic[post.topic] = { slug: post.slug, title: post.title };
    });
    // Escape "<" so a title can never close the surrounding <script> tag.
    return JSON.stringify(byTopic).replace(/</g, '\\u003c');
  } catch (err) {
    console.error('Could not load blog posts for hero links:', err.message);
    return '{}';
  }
}

marketingRouter.get('/privacy', (req, res) => {
  res.render('legal/privacy');
});
