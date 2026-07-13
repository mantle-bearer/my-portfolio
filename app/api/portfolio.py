"""Public portfolio content, detail, media, and contact endpoints."""

from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, status
from sqlmodel import Session

from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.integrations.redis import allow_rate_limited_action
from app.portfolio.contact import ContactService, deliver_contact_notification
from app.portfolio.media import MediaService
from app.portfolio.publishing import PortfolioPublishingService
from app.portfolio.schemas import (
    ContactAccepted,
    ContactCreate,
    PortfolioContentResponse,
    PublishedPostDetail,
    PublishedPostSummary,
    PublishedProjectDetail,
)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


def publishing_service(
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> PortfolioPublishingService:
    """Build a request-scoped publication service."""
    return PortfolioPublishingService(session, MediaService(session, settings))


@router.get("", response_model=PortfolioContentResponse)
def read_portfolio(
    service: PortfolioPublishingService = Depends(publishing_service),
) -> PortfolioContentResponse:
    """Return the current publication or an explicit no-publication response."""
    return service.current()


@router.get("/posts", response_model=list[PublishedPostSummary])
def list_posts(
    service: PortfolioPublishingService = Depends(publishing_service),
) -> list[PublishedPostSummary]:
    """List post summaries from the current immutable publication."""
    return service.published_posts()


@router.get("/posts/{slug}", response_model=PublishedPostDetail)
def read_post(
    slug: str,
    service: PortfolioPublishingService = Depends(publishing_service),
) -> PublishedPostDetail:
    """Return one published Markdown post."""
    return service.published_post(slug)


@router.get("/projects/{slug}", response_model=PublishedProjectDetail)
def read_project(
    slug: str,
    service: PortfolioPublishingService = Depends(publishing_service),
) -> PublishedProjectDetail:
    """Return one published internal case study."""
    return service.published_project(slug)


@router.get("/media/{media_id}")
def read_media(
    media_id: UUID,
    request: Request,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> Response:
    """Stream database media with ETag and single-range support."""
    content = MediaService(session, settings).content(media_id)
    if request.headers.get("if-none-match") == content.etag:
        return Response(status_code=status.HTTP_304_NOT_MODIFIED, headers={"ETag": content.etag})

    data = content.data
    headers = {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": f'inline; filename="{content.filename.replace(chr(34), "")}"',
        "ETag": content.etag,
    }
    range_header = request.headers.get("range")
    if not range_header:
        return Response(content=data, media_type=content.mime_type, headers=headers)

    start, end = _parse_range(range_header, len(data))
    partial = data[start : end + 1]
    headers["Content-Range"] = f"bytes {start}-{end}/{len(data)}"
    return Response(
        content=partial,
        status_code=status.HTTP_206_PARTIAL_CONTENT,
        media_type=content.mime_type,
        headers=headers,
    )


@router.post("/contact", response_model=ContactAccepted, status_code=status.HTTP_202_ACCEPTED)
async def submit_contact(
    body: ContactCreate,
    request: Request,
    tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> ContactAccepted:
    """Store an enquiry before scheduling a best-effort owner notification."""
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > settings.contact_body_max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Contact request too large",
        )
    remote_host = request.client.host if request.client else "unknown"
    allowed = await allow_rate_limited_action(
        f"portfolio-contact:{remote_host}",
        settings.contact_rate_limit,
        settings.contact_rate_window_seconds,
    )
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many contact requests",
        )
    submission = ContactService(session).create(body)
    tasks.add_task(deliver_contact_notification, submission.id, settings)
    return ContactAccepted()


def _parse_range(value: str, size: int) -> tuple[int, int]:
    if not value.startswith("bytes=") or "," in value:
        raise HTTPException(
            status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE,
            headers={"Content-Range": f"bytes */{size}"},
        )
    raw_start, separator, raw_end = value.removeprefix("bytes=").partition("-")
    if not separator:
        raise HTTPException(status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE)
    try:
        if raw_start:
            start = int(raw_start)
            end = int(raw_end) if raw_end else size - 1
        else:
            suffix = int(raw_end)
            start = max(0, size - suffix)
            end = size - 1
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE) from exc
    if start < 0 or end < start or start >= size:
        raise HTTPException(
            status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE,
            headers={"Content-Range": f"bytes */{size}"},
        )
    return start, min(end, size - 1)
