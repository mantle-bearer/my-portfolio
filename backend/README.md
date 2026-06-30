# FastAPI Template - Backend

The backend is a FastAPI app with SQLModel models, Alembic migrations, cookie JWT
auth, CSRF protection, RBAC dependencies, item CRUD, optional Redis login rate
limiting through `fastapi-redis-sdk`, and optional SMTP password recovery.

## Requirements

- Python 3.11+
- uv
- PostgreSQL

Docker Compose in the project root starts local dependency services. It does not
run the application container.

## General Workflow

From the project root:

```bash
uv sync --all-groups
uv run app seed-local
uv run fastapi dev
```

The FastAPI CLI reads `[tool.fastapi]` from `pyproject.toml`, so `uv run fastapi dev`
starts `app.main:app`.

## Database

Set `DATABASE_URL` in `.env`.

For local Docker Postgres:

```env
DATABASE_URL=postgresql+psycopg://fastapi:fastapi@localhost:5432/fastapi_template
```

For hosted Postgres, use the provider connection string and keep the
`postgresql+psycopg://` driver prefix.

PostgreSQL is required when `ENVIRONMENT=production`. SQLite is allowed only for
local experiments and tests.

Run migrations with:

```bash
uv run alembic upgrade head
```

Local and test environments also call `SQLModel.metadata.create_all()` to keep the
template easy to start.

## Auth and RBAC

Auth is owned by the FastAPI app:

- Access and refresh JWTs are stored in httpOnly cookies.
- Mutating requests require `x-csrf-token`.
- Token revocation uses `User.token_version`.
- Permissions are enforced with dependency factories.

See [../docs/auth-rbac.md](../docs/auth-rbac.md).

## Tests and Linting

```bash
uv run pytest
uv run ruff check .
```

Ruff enforces import order, modern Python rules, bugbear/simplify checks, and
PEP257-compatible docstrings for application code.
