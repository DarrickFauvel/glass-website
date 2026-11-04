import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { config } from '../config.js';
import { createMarked } from './markdown.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', '..', 'content', 'posts');
const FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/;

const marked = createMarked();

let cachedPosts = null;

// Posts are Markdown files in content/posts/, reviewed and merged via PR —
// there's no draft state in the app itself. Only the date gates visibility,
// so a merged post with a future date stays hidden until that day.
export async function listPosts() {
  const posts = await loadAllPosts();
  const today = todayInNewYork();
  return posts.filter((post) => post.date <= today);
}

export async function findPostBySlug(slug) {
  const posts = await listPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

async function loadAllPosts() {
  // Re-read on every request in dev, since `node --watch` doesn't watch content files.
  if (cachedPosts && config.nodeEnv === 'production') return cachedPosts;

  const filenames = (await fs.readdir(POSTS_DIR)).filter((name) => FILENAME_PATTERN.test(name));
  const posts = await Promise.all(filenames.map(loadPost));
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  cachedPosts = posts;
  return posts;
}

async function loadPost(filename) {
  const [, fileDate, slug] = filename.match(FILENAME_PATTERN);
  const raw = await fs.readFile(path.join(POSTS_DIR, filename), 'utf8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title,
    summary: data.summary,
    topic: data.topic,
    aiAssisted: Boolean(data.aiAssisted),
    // Each `[^n]:` footnote definition is one cited source.
    sourceCount: new Set(content.match(/^\[\^[^\]]+\]:/gm) ?? []).size,
    // YAML parses bare dates as UTC-midnight Date objects; keep the plain string.
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? fileDate),
    html: marked.parse(content),
  };
}

function todayInNewYork() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

export function formatPostDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
