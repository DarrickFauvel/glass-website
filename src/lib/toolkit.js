import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { config } from '../config.js';
import { createMarked, escapeAttribute, slugify } from './markdown.js';
import { listPosts } from './posts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLKIT_FILE = path.join(__dirname, '..', '..', 'content', 'toolkit.md');

// The toolkit is one Markdown file: `##` headings are groups, `###` headings
// are entries. Every heading gets an id from its text so posts can link
// straight to an entry (/toolkit#occams-razor), and the page builds its
// jump list from the same headings.
const headingIds = {
  renderer: {
    heading({ tokens, depth, text }) {
      const id = slugify(text);
      return `<h${depth} id="${escapeAttribute(id)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
  },
};

const marked = createMarked(headingIds);

let cached = null;

export async function loadToolkit() {
  // Re-read on every request in dev, since `node --watch` doesn't watch content files.
  if (cached && config.nodeEnv === 'production') return withPublishedLinks(cached);

  const raw = await fs.readFile(TOOLKIT_FILE, 'utf8');
  const { data, content } = matter(raw);

  const html = marked.parse(content);

  // Jump list from the rendered headings. `html` is the heading's inner HTML,
  // already escaped by marked.
  const contents = [];
  for (const [, depth, id, inner] of html.matchAll(/<h([23]) id="([^"]+)">(.*?)<\/h\1>/g)) {
    const entry = { id, html: inner };
    if (depth === '2') contents.push({ ...entry, entries: [] });
    else if (contents.length) contents.at(-1).entries.push(entry);
  }

  cached = {
    title: data.title,
    summary: data.summary,
    aiAssisted: Boolean(data.aiAssisted),
    contents,
    html,
  };
  return withPublishedLinks(cached);
}

// Entries link to related posts, and a post can be merged before its
// publish date. Until it's live, show the link text without the link so
// nobody clicks through to a 404.
async function withPublishedLinks(toolkit) {
  const published = new Set((await listPosts()).map((post) => post.slug));
  const html = toolkit.html.replace(
    /<a href="\/blog\/([a-z0-9-]+)"[^>]*>(.*?)<\/a>/g,
    (link, slug, text) => (published.has(slug) ? link : text)
  );
  return { ...toolkit, html };
}
