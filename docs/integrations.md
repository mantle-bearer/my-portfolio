# Integrations

## PostgreSQL

PostgreSQL is the production source of truth for users, permissions, portfolio
drafts, publications, media bytes, and contact submissions. SQLite remains useful
for isolated local and test runs.

## Redis

Redis is optional and powers login/contact throttling when configured. The app
uses `fastapi-redis-sdk` for connection configuration; it does not host Redis or
provide response caching. Compatible managed Redis services can expose `REDIS_URL`.

## SMTP

SMTP is optional. When configured, password recovery and owner contact
notifications use the configured sender. Contact requests are stored before
delivery, so temporary SMTP failures remain visible and retryable in the CMS.

## FastAPI Cloud

FastAPI Cloud can provide managed deployment, PostgreSQL, and Redis integrations.
Set the normal environment variables in the deployment environment and run
Alembic migrations before serving a production revision.
