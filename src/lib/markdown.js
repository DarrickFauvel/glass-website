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

// The References heading gets a source count and a toggle button. The button
// starts hidden: public/js/main.js shows it and switches the list to a compact
// view (one line per source), so without JavaScript the full list still shows.
// The <section class="footnotes"> wrapper stays first, since toolkit.js splits
// on it. The heading keeps the plugin's own attributes: toolkit.js builds its
// contents list from headings that open exactly `<h2 id="...">`, and the extra
// class is what keeps References out of it.
const FOOTNOTES_BLOCK =
  /<section class="footnotes" data-footnotes>\s*(<h2 id="footnote-label"[^>]*>[^<]*<\/h2>)\s*<ol>([\s\S]*?)<\/ol>\s*<\/section>/;

const compactFootnotes = {
  hooks: {
    postprocess(html) {
      return html.replace(FOOTNOTES_BLOCK, (match, heading, items) => {
        const count = (items.match(/<li id="footnote-/g) ?? []).length;
        const noun = count === 1 ? 'source' : 'sources';
        return `<section class="footnotes" data-footnotes>
<div class="footnotes-head">
${heading}
<span class="footnotes-count">${count} ${noun}</span>
<button type="button" class="footnotes-toggle" aria-controls="footnotes-list" aria-expanded="true" hidden>Show less</button>
</div>
<ol id="footnotes-list">${items}</ol>
</section>`;
      });
    },
  },
};

export function createMarked(...extensions) {
  return new Marked().use(
    markedFootnote({ description: 'References' }),
    externalLinks,
    compactFootnotes,
    ...extensions
  );
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
