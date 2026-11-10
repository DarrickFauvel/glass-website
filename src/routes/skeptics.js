import { Router } from 'express';
import { listSkeptics, findSkepticBySlug } from '../lib/skeptics.js';

export const skepticsRouter = Router();

skepticsRouter.get('/skeptics', async (req, res) => {
  res.render('skeptics/index', {
    skeptics: await listSkeptics(),
    pageTitle: 'Skeptics, Past and Present',
    pageDescription: 'Short, sourced profiles of people who changed how we test claims, including where they got it wrong.',
  });
});

skepticsRouter.get('/skeptics/:slug', async (req, res, next) => {
  const skeptic = await findSkepticBySlug(req.params.slug);
  if (!skeptic) return next(); // falls through to the 404 page

  res.render('skeptics/profile', {
    skeptic,
    pageTitle: skeptic.name,
    pageDescription: skeptic.summary,
  });
});
