Ship the current changes: branch → commit → push → PR → merge.

1. Check `git status` and `git diff` to understand what's changed.
2. Create a short, descriptive branch name based on the changes (kebab-case, no ticket prefix needed). Create and switch to that branch.
3. Stage the relevant changed files (be specific — no `git add -A` unless everything is intentional).
4. Write a concise commit message that describes *why*, not just what. Commit.
5. Push the branch to origin with `-u`.
6. Create a PR using `gh pr create` with a short title and a brief summary body. Target `main`. If the PR touches `content/posts/`, `content/skeptics/`, `content/toolkit.md`, or `content/quiz.md`, the body must also include the source table and every `VERIFY` item, as `content/WRITING_GUIDE.md` requires.
7. **Content review gate.** Published articles say "reviewed by GLASS organizers," so that has to be true. If the PR adds or changes anything in `content/posts/`, `content/skeptics/`, `content/toolkit.md`, or `content/quiz.md`:
   - **Do not merge.** Stop after creating the PR.
   - Tell me the PR URL and list what needs human review: each new or changed post/entry/quiz case/profile, and every open `VERIFY` item.
   - Merge only after I explicitly confirm I've reviewed it (and the `VERIFY` items are resolved or removed).

   Otherwise (no content changes), merge the PR using `gh pr merge --squash --delete-branch` and confirm it merged.

Tell me the PR URL when done.
