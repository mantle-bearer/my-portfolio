# Goodluck Igbokwe Portfolio Frontend

The frontend is a Vite, React, and TypeScript application for the public
portfolio and authenticated content workspace. TanStack Router and Query manage
navigation and server state; the project keeps its own focused UI components and
current navy, blue, orange, and white visual system.

## Local Workflow

Run the FastAPI backend on port 8000, then start the frontend:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`. Vite proxies API requests to the backend.

## Production Build

The committed build is served by FastAPI from the root `dist/` directory:

```bash
just build
```

The public portfolio is available at `/`; the legacy `/portfolio` address
redirects there. The portfolio uses static data until the first CMS publication,
then consumes the published aggregate with a transparent static fallback.

## CMS And Generated Types

Admin content screens live under `/dashboard/content`. After changing backend
contracts, regenerate the OpenAPI client and rebuild:

```bash
just client-generate
just build
```

The cookie and CSRF-aware request wrapper remains in `src/lib/api.ts`.

## End-To-End Checks

```bash
pnpm --dir frontend typecheck
pnpm --dir frontend test:e2e
```
