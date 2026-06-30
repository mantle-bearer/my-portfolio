# FastAPI Cloud

This project is a normal FastAPI application prepared for FastAPI Cloud. The
frontend is built into `dist/` and served by `app.frontend()`, so one deployed
FastAPI app serves both the API and the React UI.

## Prerequisites

- A FastAPI Cloud account.
- Python dependencies declared in `pyproject.toml`.
- `fastapi[standard]` installed locally.
- PostgreSQL available through `DATABASE_URL`.
- A fresh `dist/` build committed before deployment.

FastAPI Cloud reads `[tool.fastapi]` from `pyproject.toml`:

```toml
[tool.fastapi]
entrypoint = "app.main:app"
```

That means local development and deployment both work from the repository root:

```bash
uv run fastapi dev
uv run fastapi deploy
```

## Environment Variables

Set production environment variables from the dashboard or the CLI:

```bash
uv run fastapi cloud env set ENVIRONMENT production
uv run fastapi cloud env set DATABASE_URL "postgresql+psycopg://..."
uv run fastapi cloud env set JWT_SECRET "replace-with-a-long-random-secret" --secret
uv run fastapi cloud env set COOKIE_SECURE true
uv run fastapi cloud env set PUBLIC_BASE_URL "https://your-app.fastapicloud.app"
uv run fastapi cloud env set CORS_ORIGINS "https://your-app.fastapicloud.app"
```

Use secrets for credentials such as `DATABASE_URL`, `JWT_SECRET`,
`SMTP_PASSWORD`, and `REDIS_URL`.

Optional email settings:

```bash
uv run fastapi cloud env set SMTP_HOST "smtp.example.com"
uv run fastapi cloud env set SMTP_PORT 587
uv run fastapi cloud env set SMTP_USER "mailer@example.com"
uv run fastapi cloud env set SMTP_PASSWORD "password" --secret
uv run fastapi cloud env set EMAILS_FROM_EMAIL "mailer@example.com"
```

Optional Redis setting:

```bash
uv run fastapi cloud env set REDIS_URL "redis://..." --secret
```

Redis is optional. The app uses `fastapi-redis-sdk` when `REDIS_URL` is present,
but that SDK is a client/integration library, not hosted infrastructure. Leave
`REDIS_URL` unset if you do not need Redis-backed login rate limiting.

## Database

PostgreSQL is required in production. SQLite is only for local experiments and
tests. When `ENVIRONMENT=production`, the app rejects SQLite so a deployment does
not accidentally start with disposable local storage.

You can provide PostgreSQL manually with `DATABASE_URL`, or connect a database
through the FastAPI Cloud Neon integration. Other hosted PostgreSQL providers,
including Supabase Postgres, also work when they provide a standard connection
string.

Run migrations before deploying code that depends on new database structures:

```bash
uv run alembic upgrade head
uv run fastapi deploy
```

For zero-downtime deployments, keep migrations compatible with the old and new
versions of the app. Add tables or columns before deploying code that uses them.
Stop using columns before removing them in a later migration.

## Deployments

First deployment:

```bash
uv run fastapi deploy
```

The CLI links the local directory to a FastAPI Cloud app and creates a local
`.fastapicloud/` directory. Do not commit that directory.

Subsequent deployments use the linked app:

```bash
uv run fastapi deploy
```

The repository includes `.fastapicloudignore` to keep local artifacts, test
databases, caches, and the upstream reference folder out of Cloud uploads while
allowing `dist/` to be deployed.

## GitHub Integration

After the app deploys once, connect the repository through the FastAPI Cloud
GitHub integration if you want default-branch pushes to deploy automatically.

Recommended release flow:

1. Run tests and rebuild `dist/`.
2. Run Alembic migrations.
3. Merge or push to the default branch.
4. Confirm the deployment in FastAPI Cloud.
5. Check logs and `/api/v1/health/status`.

## Optional Keepalive

Do not add an in-app cron job just to keep external services awake. If your
database or Redis provider sleeps on inactivity, use provider settings or an
external scheduled HTTP ping. This keeps the app stateless and avoids duplicate
background jobs when more than one instance is running.
