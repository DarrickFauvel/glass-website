# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **GLASS — Greater Lowell Area Science-based Skeptics**. No build tooling, no npm, no framework — pure HTML/CSS/JS served directly.

## Development

Open `index.html` in a browser or use any static file server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

No build step, no compilation, no linting setup.

## Architecture

Single-page site with three files doing all the work:

- **`index.html`** — Full page structure. Uses [Datastar](https://data-star.dev/) (v1.0.0-beta.11) via CDN for reactive bindings. Google Fonts loaded via `<link>`.
- **`css/style.css`** — All styles (~962 lines). CSS custom properties define the design system (colors, fonts, spacing) at the top of the file. Warm cream/crimson palette, mobile-first.
- **`js/main.js`** — Three independent modules: mobile nav toggle, scroll-reveal via IntersectionObserver, and upcoming-dates generator (calculates next 6 "2nd Wednesday of the month" meetup dates).

PWA support via `manifest.json` + `sw.js` (cache-first strategy, cache key `"glass-v1"` — bump this when deploying assets changes).

## Design System

CSS custom properties are defined in `:root` in `style.css`. Key tokens:
- Colors: `--cream`, `--cream-dark`, `--crimson`, `--ink`, `--border`
- Fonts: `--font-display` (Cormorant Garant), `--font-body` (Libre Baskerville), `--font-mono` (IBM Plex Mono)
- Layout max-width: `1080px`, gutter via `clamp()`

## Accessibility

The site follows accessibility-first practices: semantic HTML5, ARIA labels, skip link, visible focus styles (crimson outline), `prefers-reduced-motion` respected in scroll animations.
