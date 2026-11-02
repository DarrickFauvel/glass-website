import { Router } from 'express';
import { loadToolkit } from '../lib/toolkit.js';

export const toolkitRouter = Router();

toolkitRouter.get('/toolkit', async (req, res) => {
  const toolkit = await loadToolkit();
  res.render('toolkit/index', {
    toolkit,
    pageTitle: toolkit.title,
    pageDescription: toolkit.summary,
  });
});
