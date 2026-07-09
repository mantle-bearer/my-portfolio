# FastAPI Template - Frontend

The frontend is built with Vite, React, TypeScript, TanStack Router, TanStack
Query, Tailwind CSS, and owned shadcn-style components.

## Requirements

- Node.js 20+
- pnpm

## Quick Start

Run the FastAPI backend on port 8000, then start Vite:

```bash
pnpm install
pnpm dev
```

From the project root, the same command is:

```bash
pnpm --dir frontend dev
```

Open http://localhost:5173. The Vite dev server proxies API requests to the
FastAPI backend.

## Production Build

The production build is committed to the root `dist/` directory and served by
FastAPI through `app.frontend()`.

From the project root:

```bash
just build
```

## Portfolio Page

The public portfolio lives at `/portfolio`. Its content is centralized in
`frontend/src/data/portfolio.ts`, with focused sections under
`frontend/src/components/portfolio`. Keep the page dependency-light and preserve
the current navy, blue, orange, white, and neumorphic brand direction.

## Generated Client

The generated OpenAPI client lives in `frontend/src/api/client`.

After backend API changes:

```bash
just client-generate
```

The app keeps a small cookie and CSRF aware fetch wrapper in `frontend/src/lib/api.ts`
and imports generated types from the client.

## End-to-End Tests

```bash
pnpm --dir frontend test:e2e
```

The Playwright suite starts the backend and verifies login, RBAC, item CRUD,
password recovery, and SPA route fallback behavior.

Run the focused portfolio checks with:

```bash
pnpm --dir frontend exec playwright test tests/portfolio.spec.ts
```
