import { Router } from 'express';

export const marketingRouter = Router();

marketingRouter.get('/', (req, res) => {
  res.render('marketing/home');
});

marketingRouter.get('/privacy', (req, res) => {
  res.render('legal/privacy');
});
