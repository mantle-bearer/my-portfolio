# Publishing

Use this checklist before publishing the template repository or cutting a tagged
release.

## Repository Cleanup

- Replace `mantle-bearer/fullstack-fastapi-template` placeholders in docs.
- Keep `.env` untracked.
- Keep `.fastapicloud/` untracked.
- Remove local databases such as `local.db`, `test.db`, and `test-e2e.db`.
- Remove local caches and build artifacts that are not intended for users.
- Confirm `dist/` is fresh and committed.
- Confirm screenshots in `img/` are current.
- Confirm the license has the right owner information.

Useful checks:

```bash
git status --ignored
just check
just test
just build
just dist-check
```

## Template Usage Paths

GitHub Template:

```bash
gh repo create my-fastapi-app --template mantle-bearer/fullstack-fastapi-template --clone
```

degit:

```bash
npx degit mantle-bearer/fullstack-fastapi-template#v0.1.0 my-fastapi-app
```

Copier:

```bash
uvx copier copy gh:mantle-bearer/fullstack-fastapi-template --vcs-ref v0.1.0 my-fastapi-app
```

Keep clone instructions as a fallback for users who want the full Git history.

## Release Flow

1. Update screenshots and docs.
2. Run local checks.
3. Confirm CI passes on the default branch.
4. Create a semver tag, for example `v0.1.0`.
5. Create GitHub release notes with setup, deployment, and upgrade notes.
6. Test `degit` and Copier generation from the tag in a temporary directory.

## FastAPI Cloud Notes

The generated app should deploy with:

```bash
uv run fastapi deploy
```

Do not commit `.fastapicloud/`; it contains local app-link metadata. Keep
`.fastapicloudignore` focused on deployment uploads, not repository publishing.
