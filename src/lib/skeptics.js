import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { config } from '../config.js';
import { createMarked } from './markdown.js';
import { loadToolkit } from './toolkit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKEPTICS_DIR = path.join(__dirname, '..', '..', 'content', 'skeptics');
const FILENAME_PATTERN = /^([a-z0-9-]+)\.md$/;
const CRITICISM_HEADING = /^## Mistakes and criticism$/m;
const MIN_SOURCES = 3;

const marked = createMarked();

let cached = null;

// Each profile is a Markdown file in content/skeptics/, and its filename is
// its URL slug. The writing guide's rules for profiles are enforced here: a
// bad toolkit slug, too few sources or a missing criticism section throws
// rather than publishing a page that breaks them.
export async function listSkeptics() {
  // Re-read on every request in dev, since `node --watch` doesn't watch content files.
  if (cached && config.nodeEnv === 'production') return cached;

  const { contents } = await loadToolkit();
  const toolLabels = new Map(
    contents.flatMap((group) => [group, ...group.entries]).map((entry) => [entry.id, entry.html])
  );

  const filenames = (await fs.readdir(SKEPTICS_DIR)).filter((name) => FILENAME_PATTERN.test(name));
  const skeptics = await Promise.all(filenames.map((filename) => loadSkeptic(filename, toolLabels)));
  skeptics.sort((a, b) => a.born - b.born);
  cached = skeptics;
  return skeptics;
}

export async function findSkepticBySlug(slug) {
  const skeptics = await listSkeptics();
  return skeptics.find((skeptic) => skeptic.slug === slug) ?? null;
}

async function loadSkeptic(filename, toolLabels) {
  const [, slug] = filename.match(FILENAME_PATTERN);
  const raw = await fs.readFile(path.join(SKEPTICS_DIR, filename), 'utf8');
  const { data, content } = matter(raw);

  for (const field of ['name', 'born', 'role', 'summary']) {
    if (!data[field]) throw new Error(`content/skeptics/${filename}: missing "${field}"`);
  }

  // Each `[^n]:` footnote definition is one cited source.
  const sourceCount = new Set(content.match(/^\[\^[^\]]+\]:/gm) ?? []).size;
  if (sourceCount < MIN_SOURCES) {
    throw new Error(`content/skeptics/${filename}: has ${sourceCount} sources, needs at least ${MIN_SOURCES}`);
  }
  if (!CRITICISM_HEADING.test(content)) {
    throw new Error(`content/skeptics/${filename}: missing the "## Mistakes and criticism" section`);
  }

  if (data.picture && !(data.picture.src && data.picture.alt)) {
    throw new Error(`content/skeptics/${filename}: a picture needs both "src" and "alt"`);
  }

  const tools = (data.tools ?? []).map((id) => {
    if (!toolLabels.has(id)) throw new Error(`content/skeptics/${filename}: unknown toolkit entry "${id}"`);
    return { id, html: toolLabels.get(id) };
  });

  const born = data.bornApproximate ? `c. ${data.born}` : data.born;

  return {
    slug,
    name: data.name,
    born: data.born,
    died: data.died ?? null,
    lifespan: data.died ? `${born}–${data.died}` : `Born ${born}`,
    role: data.role,
    summary: data.summary,
    aiAssisted: Boolean(data.aiAssisted),
    sourceCount,
    tools,
    picture: data.picture ?? null,
    html: marked.parse(content),
  };
}
