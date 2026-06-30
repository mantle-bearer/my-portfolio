set shell := ["bash", "-cu"]

setup:
    uv sync --all-groups
    pnpm --dir frontend install
    uv run app init-db

dev:
    uv run fastapi dev

frontend-dev:
    pnpm --dir frontend dev

test:
    uv run pytest

check:
    uv run ruff check .
    pnpm --dir frontend typecheck

build:
    pnpm --dir frontend build

client-generate:
    pnpm --dir frontend client:generate

dist-check:
    pnpm --dir frontend build
    git diff --exit-code -- dist

skills-check:
    uv tool run library-skills --check || true

seed-admin:
    uv run app seed-admin

seed-local:
    uv run app seed-local
