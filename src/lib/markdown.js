import { Marked } from 'marked';
import markedFootnote from 'marked-footnote';
import { config } from '../config.js';

// Shared Markdown setup for blog posts and the toolkit page: `[^n]` footnote
// citations, plus external links that open in a new tab.

const siteHost = new URL(config.baseUrl).host;

export function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// External links (sources, mostly) open in a new tab so readers keep their
// place, and so read-aloud audio isn't cut off by navigating away. The ↗ icon
// and screen-reader text say so up front. In-page footnote jumps and links to
// this site are left as normal same-tab links.
function isExternal(href) {
  try {
    const url = new URL(href);
    return /^https?:$/.test(url.protocol) && url.host !== siteHost;
  } catch {
    return false;
  }
}

const externalLinks = {
  renderer: {
    link({ href, title, tokens }) {
      if (!isExternal(href)) return false;
      const text = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${escapeAttribute(title)}"` : '';
      return `<a href="${escapeAttribute(href)}"${titleAttr} target="_blank" rel="noopener noreferrer" class="external-link">${text}<span class="external-link-icon" aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span></a>`;
    },
  },
};

export function createMarked(...extensions) {
  return new Marked().use(markedFootnote({ description: 'References' }), externalLinks, ...extensions);
}

// "Carl Sagan's Baloney Detection Kit" → "carl-sagans-baloney-detection-kit".
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
