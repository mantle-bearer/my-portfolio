# Goodluck Igbokwe Portfolio

Goodluck Igbokwe's deployable portfolio product: a public React experience,
authenticated workspace, and database-backed CMS for managing published content.
The backend is FastAPI, the data layer is SQLModel/Alembic with PostgreSQL in
production, and the frontend is React, TypeScript, Vite, and TanStack Router.

## Product Areas

- Public portfolio at `/`, with static content fallback before the first CMS
  publication.
- Authenticated workspace under `/dashboard`.
- Admin content screens for profile, About, stacks, services, projects, posts,
  media, contacts, and SEO.
- Immutable draft publications with preview, history, and restore.
- Database-backed image storage with best-effort local copies.
- Cookie JWT authentication, CSRF protection, RBAC, Redis throttling, and SMTP
  notifications.

## Requirements

- Python 3.11+
- `uv`
- Node.js 20+
- `pnpm`
- PostgreSQL for production

## Setup

```bash
just setup
just dev
```

The API and built frontend are served at `http://127.0.0.1:8000`. For frontend
iteration, run `pnpm --dir frontend dev` in a second terminal.

## Common Commands

```bash
just check          # lint and frontend type checks
just test           # backend tests
just build          # rebuild committed dist/
just client-generate
just dist-check
```

## Configuration

Copy `.env.example` to `.env` and configure the database, JWT secret, secure
cookies, optional Redis, SMTP, media root, and public base URL. Run migrations
before deploying:

```bash
uv run alembic upgrade head
```

See [docs/portfolio-cms.md](docs/portfolio-cms.md),
[docs/auth-rbac.md](docs/auth-rbac.md),
[docs/integrations.md](docs/integrations.md), and
[docs/fastapi-cloud.md](docs/fastapi-cloud.md).

## Deployment

The application is compatible with FastAPI Cloud and other platforms that can
run a FastAPI process with PostgreSQL. Keep private environment files, local
deployment metadata, and uploaded media out of source control.

## License

Copyright Goodluck Igbokwe. See [LICENSE](LICENSE) for the license terms.
