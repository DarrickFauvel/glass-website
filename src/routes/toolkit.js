import { Router } from 'express';
import { loadToolkit } from '../lib/toolkit.js';
import { loadQuiz } from '../lib/quiz.js';

export const toolkitRouter = Router();

toolkitRouter.get('/toolkit', async (req, res) => {
  const toolkit = await loadToolkit();
  res.render('toolkit/index', {
    toolkit,
    pageTitle: toolkit.title,
    pageDescription: toolkit.summary,
  });
});

toolkitRouter.get('/toolkit/quiz', async (req, res) => {
  const quiz = await loadQuiz();
  res.render('toolkit/quiz', {
    quiz,
    // Goes inside a <script> tag, so a `<` in the content can't close it.
    quizJson: JSON.stringify({ options: quiz.options, cases: quiz.cases }).replace(/</g, '\\u003c'),
    pageTitle: quiz.title,
    pageDescription: quiz.summary,
  });
});
