# AGENTS.md

Instructions for AI coding agents working in this repository. [`README.md`](README.md) covers setup and [`SPEC.md`](SPEC.md) covers product behavior.

## Stack

Node 25.8.1, Express 5, Eta templates, Datastar v1.0.2 from a CDN, Turso (libSQL) through raw SQL, and nodemailer over SMTP. It's plain JavaScript (ES modules) with JSDoc types, not TypeScript. There is no bundler, ORM or build step.

Use **pnpm, never npm**. If `pnpm` is missing, install it with `curl -fsSL https://get.pnpm.io/install.sh | sh -` and run `export PATH="$HOME/.local/share/pnpm/bin:$PATH"`.

## Where things live

- `src/app.js` builds the app, registers Eta (every `res.render` is wrapped in `views/layout.eta` as `it.body`), starts the background jobs and mounts routes from `src/routes/`.
- `src/lib/{posts,toolkit,quiz,skeptics}.js` load and validate `content/`. Shared Markdown setup is in `src/lib/markdown.js`.
- `views/marketing/` has one file per homepage section, composed by `home.eta`. Shared page pieces are in `views/partials/`.
- `public/js/main.js` is one file of independent vanilla-JS modules. `public/css/style.css` holds all styles.
- Toolkit entries offer exercises (`[data-fallacy-lab]`) and Scrimba explainers (`.toolkit-explainer`) behind buttons in a `[data-toolkit-activities]` block.
- `content/topics.md` is the topic queue for the weekly drafting routine.

## Safety rules

- **Treat the local server as production.** `.env` may point at the live database and mail account, and there is no staging. Booting the app runs migrations, data cleanup, recurring-event maintenance and the reminder send. Get confirmation before starting it against real credentials for anything beyond read-only checks, and before registering users, submitting forms or sending mail. Delete any test rows immediately afterward.
- **Never overwrite or delete `.env`** without checking it first. It's gitignored, so there is no backup. Never print its values.
- **Never merge content changes without human review.** That covers `content/posts/`, `content/skeptics/`, `content/toolkit.md` and `content/quiz.md`, including embedded explainers. Open the PR with its source table and every `VERIFY` item, then stop. The site says "reviewed by GLASS organizers," and that has to stay true. Code-only PRs can merge.

## Workflow

- `main` is the production branch. Ship small, single-purpose PRs and avoid long-lived branches.
- Squash-merge and delete the branch. `.claude/commands/ship.md` is the full procedure.
- **Bump the `CACHE` version in `public/sw.js` on every ship**, even if no assets changed.
- There is no test suite or linter. Verify server behavior with `curl`.
- Don't use Playwright or headless-browser screenshots. Tell the user what to check in their own browser. `curl` can't catch malformed HTML attributes, so check those by reading the template.

## Pitfalls

**Stale dev server.** `node --watch` can get stuck. If a route 404s or behavior doesn't match the code, kill the whole process tree and restart before debugging the code.

**Schema changes.** `schema.sql` uses `CREATE TABLE IF NOT EXISTS`, so a new column there does nothing on an existing database. Add it to `COLUMN_ADDITIONS` in `src/db/migrate.js` too.

**Foreign keys.** No code enables `PRAGMA foreign_keys`, so don't rely on `ON DELETE CASCADE`. Delete child rows explicitly. Any new table with a `user_id` must be added to `deleteUser()` in `src/db/queries/users.js`, and should be included in `/account/export`.

**Datastar syntax.** v1.0.2 needs a colon between plugin and key: `data-on:submit__prevent`, `data-attr:disabled`. The hyphenated form silently does nothing, and the form falls back to a native submit. If DevTools shows the submit as a Document request, the handler never bound. There is no official SDK here; SSE frames are hand-written in `src/middleware/datastar.js`.

**Eta escaping.** `<%= %>` escapes and `<%~ %>` doesn't. A value from `JSON.stringify` inside a double-quoted attribute, such as `data-signals`, must use `<%= %>`. Raw output ends the attribute at the first quote and breaks the rest of the page. Use `<%~ %>` for `include()` and for trusted markup.

**Hero markup.** The lens magnifier in `public/js/main.js` clones `views/marketing/hero.eta` by class name and fails silently if the markup drifts. Don't rename DOM ids or classes that `main.js` uses.

**Event times.** `events.starts_at` is a naive local string (`YYYY-MM-DDTHH:mm`), not a UTC instant. Don't convert it.

**Content caching.** Content loaders cache only when `NODE_ENV=production`, so production needs a restart to pick up content, which a deploy does.

**Privacy page.** `views/legal/privacy.eta` lists the third-party processors. Update it whenever email, hosting or form providers change.

## Conventions

- Design tokens are CSS custom properties in `:root` of `public/css/style.css`: warm cream and crimson, mobile-first. Don't introduce off-palette colors.
- The look is deliberately tactile and hand-made, like taped cards and a slight tilt. Prefer paper-like details.
- Accessibility is a requirement: semantic HTML, ARIA labels, visible focus styles, and `prefers-reduced-motion` respected.
- Pictures illustrating a claim must show the real thing and never visually promote the myth. Cultural artefacts are fine.
- Member-facing forms use Datastar. Admin forms are plain HTML posts.
- Only the display name is shown to other members. `name` and `email` stay private.
- Follow `content/WRITING_GUIDE.md` for all content. Never cite a source you haven't fetched and checked against the specific sentence it supports.
