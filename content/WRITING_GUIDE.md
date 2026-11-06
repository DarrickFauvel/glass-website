# GLASS Blog — Writing Guide

This is the editorial brief for every post on `/blog`, whether a person or an AI agent drafts it. A post is published only by merging its PR, after a human has checked the source table described below.

## Voice

- Curious and respectful. Never mock believers: most people who hold a belief got there by reasonable-seeming steps, and the post should show those steps fairly.
- Match the site's tone: *Think critically. Question everything.* That includes questioning our own side's overstatements.
- Plain language. Define any jargon the first time it appears.

## Shape

800–1200 words, Markdown, with these `##` sections (headings can be reworded to fit the topic):

1. **The claim**: what people believe, stated in its strongest form.
2. **Why it's compelling**: the real experiences, evidence, or intuitions behind it.
3. **What the evidence shows**: the core of the post. Explain mechanisms, not just verdicts.
4. **The question**: answer the hero clue's `question` (see `content/topics.md`) directly.
5. **The thinking tool**: one reusable reasoning skill the topic illustrates (burden of proof, base rates, confirmation bias, misidentification, consensus vs. a single study, and so on). End the section with a line linking the matching entry in `content/toolkit.md` (served at `/toolkit`), for example `*This tool has an entry in [The Skeptic's Toolkit](/toolkit#occams-razor), our guide to reasoning tools, logical fallacies, and cognitive biases.*` Anchors are the entry's heading, slugified. If the toolkit has no matching entry yet, add one in the same PR, sourced to the same standard as a post.

No `#` heading in the body. The page renders the title from frontmatter.

## Sourcing (non-negotiable)

- **Cite every factual claim** with a Markdown footnote (`[^1]`). Statistics, study results, dates, quotes, and "scientists found…" statements all need one. An uncited empirical claim fails review.
- **Source hierarchy.** Use the highest tier available. Tiers 3–4 can never be the only support for an empirical claim.
  1. **Systematic reviews, meta-analyses, and consensus reports** from scientific bodies (National Academies, WHO, EFSA, NASA, NOAA, EPA, and similar)
  2. **Peer-reviewed primary studies**, linked by DOI (`https://doi.org/...`) whenever one exists
  3. **Expert-authored skeptic and science outlets** (Skeptical Inquirer, Science-Based Medicine, Skeptic)
  4. **Reputable journalism or polling**, only for history, context, or public opinion
- **Minimum per post:** 5 distinct sources, at least 2 from tiers 1–2.
- **Never cite:** Wikipedia, personal blogs, YouTube, press-release rewrites, or AI-generated summaries. Use them to *find* sources, then cite the source itself.
- **Verify every source** before citing it. Fetch it (or its abstract via Crossref or Europe PMC when the publisher blocks fetching), and confirm that it exists **and** that it supports the specific sentence it's attached to, not just the general topic.
- **Never invent** quotes, numbers, authors, titles, or studies. If you can't verify a detail, leave it out or flag it (see below).
- **Footnote format.** Start with the tier label, then a full citation:
  `[^1]: **Peer-reviewed study.** Sykes, B. C., et al. (2014). "Genetic analysis of hair samples…" *Proceedings of the Royal Society B*, 281, 20140161. https://doi.org/10.1098/rspb.2014.0161`
  Labels: `Consensus report`, `Systematic review`, `Meta-analysis`, `Review article` (a peer-reviewed narrative review, which counts as tier 2), `Peer-reviewed study`, `Government agency`, `Expert commentary`, `Journalism`, `Survey`, `Reference work` (a scholarly reference such as the *Stanford Encyclopedia of Philosophy* or *Internet Encyclopedia of Philosophy*; fine for defining concepts and fallacies, not for empirical claims), `Primary source` (a person's own letter, paper or book, or their institution's records; fine for what they said and did, not for whether they were right).

## Science-based framing

- State the strength of the evidence accurately. Name the consensus when one exists, and say "we don't know" when that's the honest answer.
- Don't overstate a debunk. "No good evidence for X" isn't the same as "X is proven impossible," and a hoax in one case doesn't explain every case.
- Separate questions that often get bundled together. For GMOs, for example, food safety, herbicide-resistant weeds, and corporate practices are three different questions with different evidence.
- For health topics, state the consensus plainly and link the authoritative body directly. Never imply medical advice.
- If the hero clue's own wording overstates something, the post corrects it rather than repeating it.

## Flagging uncertainty

If a claim seems right but you couldn't fully verify it, keep it only with an HTML comment right after it:

```
<!-- VERIFY: only the citation metadata was checked; the paper's full text was not accessible -->
```

The reviewer resolves every `VERIFY` before merging. List all of them in the PR body.

## Quiz cases

`content/quiz.md` holds the cases for the Spot the Fallacy quiz at `/toolkit/quiz`, and they go through the same review as a post.

- **Scenarios are fictional,** so they need no citations. Don't attribute invented quotes or results to real people, organizations, or studies.
- **Explain the reasoning, not the world.** `why` and `notWhy` should say why the argument works or fails, without making empirical claims of their own. If a case needs a fact to make sense, cite it in the toolkit entry instead, or rewrite the case.
- **Match the toolkit.** The answer must fit that fallacy's definition in `content/toolkit.md`. Only hand-pick a near-miss distractor that's clearly wrong on a close reading, and never one that also fits.
- **Keep it fair.** Critique the argument, never the believer. Sound cases must be sound, not just harder to fault, because they exist to show that not every argument is a fallacy.

## Skeptic profiles

`content/skeptics/<slug>.md` holds one profile per person, served at `/skeptics/<slug>`. Profiles go through the same review as a post, and the sourcing rules above apply, with these differences:

- **Minimum per profile:** 3 distinct sources, at least one of them a primary or scholarly source. The 5-source post minimum doesn't apply.
- **Include the failures.** Every profile needs a `## Mistakes and criticism` section. The page won't load without it, or with fewer than 3 sources. Report a person's real mistakes and the fairest version of the criticism, and say when a critic has a stake in the dispute.
- **Be careful with living people.** Stick to their public work. Attribute criticism to the person making it, and keep personal details to what they've said publicly and what bears on that work. Before publishing or editing, check that a living subject's page is still accurate.
- **Don't write a hagiography or a takedown.** The point is to show how good reasoning works in practice, including when it fails.

Add `tools` to the frontmatter with toolkit heading slugs, and the page links them. A bad slug throws an error.

```yaml
---
name: "Carl Sagan"
born: 1934
died: 1996              # leave out for living people
role: "Astronomer and science communicator"
summary: "One or two sentences for the index and the meta description."
tools: [carl-sagans-baloney-detection-kit]
aiAssisted: true
---
```

## Frontmatter

```yaml
---
title: "Is Bigfoot Out There?"
date: 2026-10-29        # publish date; future dates stay hidden until that day
summary: "One or two sentences for the blog index and the meta description."
topic: bigfoot          # matches the topic slug in content/topics.md
aiAssisted: true        # shows the AI-assistance disclosure on the post
---
```

Filename: `content/posts/YYYY-MM-DD-<slug>.md`. The slug becomes the URL `/blog/<slug>`.

## PR checklist

The PR body must include:

1. A **source table** with one row per footnote: claim supported → source → tier → verified (✓ / ✗ + note).
2. Every `VERIFY` item.
3. Confirmation that the topic was checked off in `content/topics.md`.
