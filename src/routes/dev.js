import { Router } from 'express';
import { eta } from '../eta.js';
import { startSSE, patchSignals, patchElements } from '../middleware/datastar.js';
import { createNote, listNotes } from '../db/queries/notes.js';

export const devRouter = Router();

devRouter.get('/dev/notes-test', async (req, res) => {
  const notes = await listNotes();
  res.render('dev/notes-test', { notes });
});

devRouter.post('/dev/notes-test', async (req, res) => {
  const body = String(req.body.notes?.body ?? '').trim();

  if (!body) {
    startSSE(res);
    patchSignals(res, { notes: { submitting: false, error: 'Please enter a note.' } });
    return res.end();
  }

  await createNote(body);
  const notes = await listNotes();
  const panelHtml = eta.render('dev/_notes-panel', { notes, status: body });

  startSSE(res);
  patchElements(res, panelHtml, { selector: '#notes-panel', mode: 'inner' });
  patchSignals(res, { notes: { submitting: false, error: '', body: '' } });
  res.end();
});
