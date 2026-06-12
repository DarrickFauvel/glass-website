Ship the current changes: branch → commit → push → PR → merge.

1. Check `git status` and `git diff` to understand what's changed.
2. Create a short, descriptive branch name based on the changes (kebab-case, no ticket prefix needed). Create and switch to that branch.
3. Stage the relevant changed files (be specific — no `git add -A` unless everything is intentional).
4. Write a concise commit message that describes *why*, not just what. Commit.
5. Push the branch to origin with `-u`.
6. Create a PR using `gh pr create` with a short title and a brief summary body. Target `main`.
7. Merge the PR using `gh pr merge --squash --delete-branch` and confirm it merged.

Tell me the PR URL when done.
