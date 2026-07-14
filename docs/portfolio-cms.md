# Portfolio CMS

The portfolio CMS keeps editable draft content separate from public content. Admin
changes are private until an administrator publishes the complete workspace. A
publication is an immutable JSON snapshot, and restoring an older publication
creates a new version instead of rewriting history.

## Runtime Flow

- `/dashboard/content` contains the authenticated editing screens.
- `/dashboard/content/preview` renders the current draft without publishing it.
- `POST /api/v1/admin/portfolio/publish` validates and publishes the whole draft.
- `GET /api/v1/portfolio` returns the current snapshot.
- Before the first publication, the React portfolio renders `portfolio.ts`.
- `/` serves the public portfolio and `/portfolio` redirects to it.
- Existing Items, Users, Settings, authentication, and compatibility routes remain available.

The initial draft is seeded idempotently during normal database initialization. It
can also be initialized explicitly:

```bash
uv run app seed-portfolio
```

Seeding never publishes. The first publication must be created manually from the
admin CMS.

## Media

CMS uploads accept JPEG, JPG/JFIF, PNG, and WebP images up to 8 MB. SVG uploads are
rejected. Uploaded bytes are canonical in PostgreSQL or SQLite, while a local copy
under `MEDIA_ROOT` is best effort. A failed local write does not fail the upload,
and public delivery falls back to the database bytes.

Configure media with:

```env
MEDIA_ROOT=./media
MEDIA_MAX_BYTES=8388608
```

Seeded repository images remain static-path media until replaced in the CMS.
Published snapshots contain media URLs and IDs, never binary data. Permanent purge
is rejected while an asset is referenced by draft content or publication history.

## Contact Inbox

`POST /api/v1/portfolio/contact` validates and stores an enquiry before attempting
owner notification. SMTP failure does not reject the visitor's request. Failed
deliveries remain visible and retryable in the Contact screen.

The private notification address is configured in the Profile screen and is not
included in public content. Redis applies shared IP-based throttling when available.
A bounded in-process limiter protects local and single-instance deployments when
Redis is unavailable; configure Redis for consistent limits across multiple instances.

```env
CONTACT_BODY_MAX_BYTES=16384
CONTACT_RATE_LIMIT=5
CONTACT_RATE_WINDOW_SECONDS=3600
```

## Deployment

Apply database migrations before starting a production revision:

```bash
uv run alembic upgrade head
```

After backend contract changes, refresh the generated client and committed build:

```bash
just client-generate
just build
```

Legacy compatibility remains a separate maintenance phase. Do not remove
historical migrations, auth, Items, Users, or Settings as part of routine CMS work.
