# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for **GLASS — Greater Lowell Area Science-based Skeptics**. Node.js + Express, server-rendered with [Eta](https://eta.js.org/) templates, no build step (no bundler/compiler — Eta and static assets are used as-is). Package manager is **pnpm**, not npm.

As of the Stage 1 restructure (see `/home/codespace/.claude/plans/now-that-this-site-eager-aurora.md`), this is a faithful 1:1 port of the previous 100%-static site — same markup, styles, and client-side behavior, now served by Express instead of as flat files. No database, auth, or member features exist yet; those land incrementally in later milestones per that plan.

## Development

```bash
pnpm install
pnpm dev     # node --watch server.js, http://localhost:8080
# or
pnpm start   # node server.js
```

pnpm isn't preinstalled in every environment — if the `pnpm` command is missing, install it via the standalone script (not npm): `curl -fsSL https://get.pnpm.io/install.sh | sh -`, then `export PATH="$HOME/.local/share/pnpm:$PATH"`.

## Architecture

- **`server.js`** — entrypoint; builds the app and starts listening.
- **`src/app.js`** — Express app factory: registers the Eta view engine (every `res.render(view)` is wrapped in `views/layout.eta`, passed as `it.body`), mounts `express.static` on `public/`, and wires routes.
- **`src/config.js`** — reads `PORT`/`NODE_ENV` from `process.env`.
- **`src/routes/marketing.js`** — `GET /` renders `views/marketing/home.eta`.
- **`views/layout.eta`** — page shell (head, header, footer, QR modal, closing scripts); includes `views/partials/*`.
- **`views/marketing/*.eta`** — one file per homepage section (hero, quote-band, about, events-preview, contact-form, join-us), composed by `home.eta`. Every DOM id/class the decorative JS depends on is preserved exactly — the hero section in particular is a byte-for-byte port; the ~680-line lens-magnifier effect in `main.js` clones its markup by class name and breaks silently on drift.
- **`public/`** — served as static assets at their original paths (`/css/style.css`, `/js/main.js`, `/favicon.svg`, `/manifest.json`, `/sw.js`, `/icons/*`, `/images/*`) so templates need no path changes.
  - **`public/css/style.css`** — all styles (~962 lines). CSS custom properties define the design system (colors, fonts, spacing) at the top of the file. Warm cream/crimson palette, mobile-first.
  - **`public/js/main.js`** — independent vanilla-JS modules (theme toggle, mobile nav, scroll-reveal, scrollspy, contact-form validation/submit to Web3Forms, hero lens magnifier, QR modal, upcoming-dates generator, etc.), moved as-is — untouched by the Stage 1 restructure.

PWA support via `public/manifest.json` + `public/sw.js` (cache-first strategy, cache key `"glass-v8"` — bump this when deploying assets changes). Note: `sw.js` still does stale-while-revalidate on every GET, which will need to change once routes become dynamic/user-specific (planned for a later milestone) — harmless today since every route is still static marketing content.

## Design System

CSS custom properties are defined in `:root` in `style.css`. Key tokens:
- Colors: `--cream`, `--cream-dark`, `--crimson`, `--ink`, `--border`
- Fonts: `--font-display` (Cormorant Garant), `--font-body` (Libre Baskerville), `--font-mono` (IBM Plex Mono)
- Layout max-width: `1080px`, gutter via `clamp()`

## Accessibility

The site follows accessibility-first practices: semantic HTML5, ARIA labels, skip link, visible focus styles (crimson outline), `prefers-reduced-motion` respected in scroll animations.
