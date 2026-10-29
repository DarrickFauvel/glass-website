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
5. **The thinking tool**: one reusable reasoning skill the topic illustrates (burden of proof, base rates, confirmation bias, misidentification, consensus vs. a single study, and so on).

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
  Labels: `Consensus report`, `Systematic review`, `Meta-analysis`, `Review article` (a peer-reviewed narrative review, which counts as tier 2), `Peer-reviewed study`, `Government agency`, `Expert commentary`, `Journalism`, `Survey`.

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
