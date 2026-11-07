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
  // already escaped by marked. `hasActivities` marks entries with a Try it or
  // Watch block, so the list never needs updating by hand.
  const contents = [];
  for (const section of html.split(/(?=<h[23] id=")/)) {
    const heading = section.match(/^<h([23]) id="([^"]+)">(.*?)<\/h\1>/);
    if (!heading) continue;
    const [, depth, id, inner] = heading;
    const entry = { id, html: inner, hasActivities: section.includes('data-toolkit-activities') };
    if (depth === '2') contents.push({ ...entry, entries: [] });
    else if (contents.length) contents.at(-1).entries.push(entry);
  }

  cached = {
    title: data.title,
    summary: data.summary,
    aiAssisted: Boolean(data.aiAssisted),
    contents,
    html: structure(html),
  };
  return withPublishedLinks(cached);
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// Turns the flat rendered Markdown into sections so every entry reads the
// same way: each `##` group becomes a <section class="toolkit-group"> with a
// "Part" kicker, each `###` entry a <section class="toolkit-entry">. Inside an
// entry, a blockquote is its "Sounds like" example and a paragraph starting
// with **In action:** is its link to a post. The References list is left as is.
function structure(html) {
  const footnotesAt = html.indexOf('<section class="footnotes"');
  const body = footnotesAt === -1 ? html : html.slice(0, footnotesAt);
  const footnotes = footnotesAt === -1 ? '' : html.slice(footnotesAt);

  const [intro, ...groups] = body.split(/(?=<h2 id=")/);
  const lastIndex = groups.length - 1;

  const sections = groups.map((group, i) => {
    const [groupHead, ...entries] = group.split(/(?=<h3 id=")/);
    // A closing group with no entries (the fallacy fallacy) reads as a coda,
    // not another numbered part.
    const isCoda = i === lastIndex && i > 0 && entries.length === 0;
    const kicker = isCoda ? 'Finally' : `Part ${ROMAN[i] ?? i + 1}`;
    const head = groupHead.replace(/^(<h2 id="[^"]+">)/, `<p class="toolkit-part" aria-hidden="true">${kicker}</p>\n$1`);
    const entryHtml = entries.map((entry) => `<section class="toolkit-entry">\n${entryParts(entry)}</section>\n`).join('');
    return `<section class="toolkit-group${isCoda ? ' toolkit-group--coda' : ''}">\n${head}${entryHtml}</section>\n`;
  });

  return `<div class="toolkit-intro">\n${intro}</div>\n${sections.join('')}${footnotes}`;
}

function entryParts(entry) {
  return entry
    .replace(
      /<blockquote>\s*([\s\S]*?)\s*<\/blockquote>/g,
      '<figure class="toolkit-example">\n<figcaption>Sounds like</figcaption>\n<blockquote>\n$1\n</blockquote>\n</figure>'
    )
    .replace(/<p><strong>In action:<\/strong>\s*/g, '<p class="toolkit-in-action"><span class="toolkit-in-action-label">In action</span> ');
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
