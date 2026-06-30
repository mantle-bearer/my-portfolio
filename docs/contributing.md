# Contributing

Commit messages must contain at most 10 words.

Recommended checks:

```bash
just test
just check
pnpm --dir frontend test:e2e
just build
just dist-check
just skills-check
```

Install the local commit hook:

```bash
cp scripts/commit-msg-limit.py .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
```
