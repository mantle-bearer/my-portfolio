# Integrations

## PostgreSQL

PostgreSQL is the source of truth for users, roles, permissions, and app data.
Use local Docker Postgres for development or a hosted Postgres provider in production.

Production deployments require PostgreSQL. SQLite is accepted only in local and
test environments, where it is useful for quick experiments and isolated tests.

Supported production options include:

- FastAPI Cloud's Neon integration.
- Supabase Postgres.
- Any hosted PostgreSQL service that provides a standard connection string.

Set the connection string with:

```env
DATABASE_URL=postgresql+psycopg://user:password@host:5432/database
```

## Redis

Redis is optional. When configured and reachable, it powers login rate limiting.
If Redis is missing or unavailable, login remains available and the app reports Redis
as `not_configured` or `unavailable` in `/api/v1/health/status`.

The app uses `fastapi-redis-sdk` as its Redis integration layer for SDK-backed
connection configuration. The SDK does not host Redis and does not replace a Redis
account. Because the SDK is still new, this template uses it conservatively and
does not enable endpoint response caching by default. If you enable Redis, use a
Redis 7.4+ server from FastAPI Cloud's Redis Cloud integration, Redis Cloud,
Upstash, or another compatible provider.

FastAPI Cloud's Redis Cloud integration can create or connect a Redis database and
expose it as `REDIS_URL`. Leave `REDIS_URL` empty if you do not need Redis-backed
rate limiting.

The app does not run an internal Redis keepalive worker. Use provider settings or
an external scheduled ping if your provider sleeps idle resources.

## SMTP

SMTP is optional. When configured, password recovery sends reset links using
`PUBLIC_BASE_URL`. When unset, recovery endpoints still return enumeration-safe
success responses and log that email is disabled.
