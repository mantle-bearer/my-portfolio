# Goodluck Igbokwe Portfolio Backend

This FastAPI backend powers the deployable portfolio product, its authenticated
workspace, and the portfolio CMS. It owns cookie-based JWT sessions, CSRF
protection, RBAC, SQLModel/Alembic persistence, media delivery, contact inbox
handling, optional Redis throttling, and SMTP notifications.

## Local Workflow

From the repository root:

```bash
uv sync --all-groups
uv run app seed-local
uv run fastapi dev
```

The application serves the API and the built React frontend through
`app.frontend()`.

## Database

Set `DATABASE_URL` in `.env`. PostgreSQL is required in production; SQLite is
supported for local development and tests.

```bash
uv run alembic upgrade head
```

Portfolio uploads are stored as database bytes, with an optional best-effort copy
under `MEDIA_ROOT`. A failed local write does not make an upload unavailable.

## Authentication And CMS

Access and refresh tokens use httpOnly cookies, mutating requests require the
CSRF header, and permissions are enforced by dependencies. Admins edit draft
portfolio content under `/api/v1/admin/portfolio` and publish immutable snapshots
through the publication endpoints. The public aggregate is served by
`GET /api/v1/portfolio`.

See [../docs/auth-rbac.md](../docs/auth-rbac.md) and
[../docs/portfolio-cms.md](../docs/portfolio-cms.md).

## Checks

```bash
uv run pytest
uv run ruff check .
```
