# Branch Protection Guidelines

To avoid diverged history and push failures:

1. Always run git pull --rebase origin main before committing and pushing.
2. Never commit directly to main from an AI session without pulling first.
3. Resolve conflicts by keeping the most recent version of each conflicted file if the local changes are intentional fixes.
