# Publishing And Releases

This repository contains Goodluck Igbokwe's deployable portfolio product. A
release is ready when the public portfolio, authenticated workspace, CMS
contracts, and committed frontend build agree.

## Pre-release Checks

- Keep `.env`, `.fastapicloud/`, local databases, and private media out of Git.
- Run `just check`, `just test`, `just build`, and `just dist-check`.
- Review SEO, public links, contact delivery configuration, and the publication
  history before deployment.
- Confirm the release notes describe migrations and any required environment
  changes.

## Release Flow

1. Update product documentation and screenshots when the interface changes.
2. Apply and verify Alembic migrations against the target database.
3. Regenerate the OpenAPI client after contract changes.
4. Run backend, frontend, and browser checks.
5. Create a version tag and publish release notes with upgrade instructions.

## FastAPI Cloud

The application can deploy through FastAPI Cloud:

```bash
uv run fastapi deploy
```

Keep `.fastapicloud/` local. Configure PostgreSQL, Redis, SMTP, secure cookies,
and `PUBLIC_BASE_URL` through the deployment environment.
