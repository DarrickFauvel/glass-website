import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { config } from '../config.js';
import { loadToolkit } from './toolkit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUIZ_FILE = path.join(__dirname, '..', '..', 'content', 'quiz.md');

const FALLACIES_GROUP = 'logical-fallacies';

// The answer for cases with nothing wrong. It has no toolkit entry of its own,
// so it points at the closing section on not over-applying fallacies.
const SOUND = 'sound';
const SOUND_OPTION = {
  id: SOUND,
  label: 'This reasoning holds up',
  href: '/toolkit#a-final-tool-the-fallacy-fallacy',
};

// Must match the round the game deals in public/js/main.js.
const SOUND_PER_ROUND = 2;
const FALLACIES_PER_ROUND = 8;

let cached = null;

export async function loadQuiz() {
  // Re-read on every request in dev, since `node --watch` doesn't watch content files.
  if (cached && config.nodeEnv === 'production') return cached;

  const raw = await fs.readFile(QUIZ_FILE, 'utf8');
  const { data } = matter(raw);
  const { contents } = await loadToolkit();

  // Option labels come from the toolkit's headings, so a rename there carries
  // through here. `html` is already-escaped inline HTML from marked.
  const fallacies = contents.find((group) => group.id === FALLACIES_GROUP)?.entries ?? [];
  const options = [
    ...fallacies.map((entry) => ({ id: entry.id, label: entry.html, href: `/toolkit#${entry.id}` })),
    SOUND_OPTION,
  ];

  validate(data.cases, new Set(options.map((option) => option.id)));

  cached = {
    title: data.title,
    summary: data.summary,
    aiAssisted: Boolean(data.aiAssisted),
    options,
    cases: data.cases,
  };
  return cached;
}

// A case that points at a missing toolkit entry would show a broken question,
// so bad content fails loudly instead.
function validate(cases, optionIds) {
  const fail = (message) => {
    throw new Error(`content/quiz.md: ${message}`);
  };
  if (!Array.isArray(cases)) fail('`cases` must be a list');

  const seen = new Set();
  for (const quizCase of cases) {
    const { id, scenario, answer, distractors, why, notWhy } = quizCase;
    if (!id) fail('a case is missing its `id`');
    if (seen.has(id)) fail(`duplicate case id "${id}"`);
    seen.add(id);

    if (!scenario || !why) fail(`case "${id}" needs a \`scenario\` and a \`why\``);
    if (!optionIds.has(answer)) fail(`case "${id}" has an unknown answer "${answer}"`);

    const wrongCount = answer === SOUND ? 3 : 2;
    if (distractors?.length !== wrongCount) fail(`case "${id}" needs exactly ${wrongCount} distractors`);
    if (new Set(distractors).size !== wrongCount || distractors.includes(answer) || distractors.includes(SOUND)) {
      fail(`case "${id}" has a repeated or misplaced distractor`);
    }

    // Every wrong choice gets its own explanation, including "holds up" on a
    // case that doesn't.
    const wrongChoices = answer === SOUND ? distractors : [...distractors, SOUND];
    for (const choice of wrongChoices) {
      if (!optionIds.has(choice)) fail(`case "${id}" has an unknown distractor "${choice}"`);
      if (!notWhy?.[choice]) fail(`case "${id}" is missing \`notWhy\` for "${choice}"`);
    }
  }

  const soundCount = cases.filter((quizCase) => quizCase.answer === SOUND).length;
  const fallacyCount = new Set(cases.map((quizCase) => quizCase.answer).filter((answer) => answer !== SOUND)).size;
  if (soundCount < SOUND_PER_ROUND || fallacyCount < FALLACIES_PER_ROUND) {
    fail(`a round needs ${SOUND_PER_ROUND} sound cases and ${FALLACIES_PER_ROUND} different fallacies`);
  }
}
