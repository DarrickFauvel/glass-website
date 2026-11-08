# GLASS website

The website of **GLASS, the Greater Lowell Area Science-based Skeptics**: <https://sciencebasedskeptics.com>

It has meetup dates and RSVPs, member accounts with email reminders, sourced articles on popular claims, a guide to reasoning tools and fallacies, and profiles of notable skeptics.

Built with Node.js, Express and server-rendered [Eta](https://eta.js.org/) templates, with [Datastar](https://data-star.dev/) for interactive forms and [Turso](https://turso.tech/) (libSQL) for data. There is no build step.

## Getting started

You need Node 25.8.1 (see `.nvmrc`) and [pnpm](https://pnpm.io/). This project uses pnpm rather than npm.

```bash
pnpm install
cp .env.example .env   # then fill in the values
pnpm dev               # http://localhost:8080
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Runs the server and restarts it when code changes |
| `pnpm start` | Runs the server |
| `pnpm migrate` | Applies the database schema |

Public pages that don't read the database still render without credentials. Pages and forms that need the database or email need the matching values in `.env`.

> **Be careful with a real `.env`.** There is no staging environment or local database. Starting the server runs migrations, cleanup and the event-reminder job against whatever database `.env` names, and those can send real email.

## Project layout

| Path | Contents |
| --- | --- |
| `server.js`, `src/app.js` | Entry point, and the Express app with its background jobs |
| `src/routes/` | Route handlers, one file per area |
| `src/db/` | Schema, migrations and raw SQL queries |
| `src/lib/`, `src/services/` | Content loaders, date helpers, auth, email and reminders |
| `views/` | Eta templates, all wrapped by `views/layout.eta` |
| `public/` | Static assets: CSS, client JavaScript, service worker, images |
| `content/` | Articles, toolkit, quiz and skeptic profiles, as Markdown |

## Adding content

Articles, toolkit entries, quiz cases and skeptic profiles are Markdown files in `content/`, and merging a pull request publishes them. There is no CMS.

Everything must follow [`content/WRITING_GUIDE.md`](content/WRITING_GUIDE.md), including its sourcing rules. A person has to review content before it merges, because the site says it was reviewed by GLASS organizers.

## More documentation

- [`SPEC.md`](SPEC.md) describes what the site does: features, rules, data model and routes.
- [`AGENTS.md`](AGENTS.md) has working instructions for AI coding agents and the project's non-obvious pitfalls.
- [`content/WRITING_GUIDE.md`](content/WRITING_GUIDE.md) is the editorial brief.
