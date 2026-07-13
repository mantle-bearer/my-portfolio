"""Validation, storage, and delivery helpers for portfolio media."""

import hashlib
import json
from contextlib import suppress
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlmodel import Session, select

from app.core.config import Settings
from app.portfolio.models import (
    AboutCard,
    MediaAsset,
    PortfolioPost,
    PortfolioProject,
    PortfolioPublication,
    PortfolioSite,
)

ACCEPTED_MEDIA_TYPES = {"image/jpeg", "image/png", "image/webp"}


@dataclass(frozen=True)
class MediaContent:
    """Bytes and cache metadata ready for an HTTP response."""

    data: bytes
    mime_type: str
    etag: str
    filename: str


class MediaService:
    """Store canonical image bytes in the database with optional local copies."""

    def __init__(self, session: Session, settings: Settings):
        """Initialize media persistence for one request."""
        self.session = session
        self.settings = settings

    async def upload(self, upload: UploadFile, alt_text: str, created_by_id: UUID) -> MediaAsset:
        """Validate an image, persist bytes, and best-effort a local copy."""
        data = await upload.read(self.settings.media_max_bytes + 1)
        if not data:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Empty file"
            )
        if len(data) > self.settings.media_max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail="Image too large"
            )

        mime_type, width, height = inspect_image(data)
        declared_type = (upload.content_type or "").lower()
        if declared_type not in ACCEPTED_MEDIA_TYPES or declared_type != mime_type:
            jpeg_alias = declared_type in {"image/jpg", "image/jfif"} and mime_type == "image/jpeg"
            if not jpeg_alias:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="File content does not match an accepted image type",
                )

        filename = Path(upload.filename or "image").name[:255]
        checksum = hashlib.sha256(data).hexdigest()
        media = MediaAsset(
            filename=filename,
            mime_type=mime_type,
            size_bytes=len(data),
            width=width,
            height=height,
            checksum=checksum,
            alt_text=alt_text.strip(),
            storage_kind="database",
            byte_data=data,
            created_by_id=created_by_id,
        )
        self.session.add(media)
        self.session.flush()
        media.local_path = self._attempt_local_copy(media, data)
        self.session.add(media)
        self.session.commit()
        self.session.refresh(media)
        return media

    def list(self, include_archived: bool = False) -> list[MediaAsset]:
        """List media newest first without loading binary columns separately."""
        statement = select(MediaAsset)
        if not include_archived:
            statement = statement.where(MediaAsset.is_archived.is_(False))
        return list(self.session.exec(statement.order_by(MediaAsset.created_at.desc())).all())

    def get(self, media_id: UUID, include_archived: bool = False) -> MediaAsset:
        """Return one media asset."""
        media = self.session.get(MediaAsset, media_id)
        if media is None or (media.is_archived and not include_archived):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
        return media

    def update(self, media_id: UUID, values: dict[str, object]) -> MediaAsset:
        """Update safe media metadata fields."""
        media = self.get(media_id, include_archived=True)
        expected = values.pop("expected_updated_at", None)
        if expected is not None and _as_utc(expected) != _as_utc(media.updated_at):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Media changed")
        for key, value in values.items():
            setattr(media, key, value)
        media.updated_at = datetime.now(UTC)
        self.session.add(media)
        self.session.commit()
        self.session.refresh(media)
        return media

    def archive(self, media_id: UUID) -> MediaAsset:
        """Hide media from new content while keeping existing references intact."""
        media = self.get(media_id, include_archived=True)
        media.is_archived = True
        media.updated_at = datetime.now(UTC)
        self.session.add(media)
        self.session.commit()
        self.session.refresh(media)
        return media

    def purge(self, media_id: UUID) -> None:
        """Permanently delete only media with no draft or snapshot references."""
        media = self.get(media_id, include_archived=True)
        if self._is_referenced(media_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Media is still referenced by portfolio content or history",
            )
        if media.local_path:
            with suppress(OSError):
                Path(media.local_path).unlink(missing_ok=True)
        self.session.delete(media)
        self.session.commit()

    def content(self, media_id: UUID) -> MediaContent:
        """Read a local media copy when available, then fall back to database bytes."""
        media = self.get(media_id, include_archived=True)
        data: bytes | None = None
        if media.local_path:
            try:
                data = Path(media.local_path).read_bytes()
            except OSError:
                data = None
        if data is None:
            data = media.byte_data
        if data is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media bytes missing")
        return MediaContent(
            data=data,
            mime_type=media.mime_type,
            etag=f'"{media.checksum}"',
            filename=media.filename,
        )

    def public_url(self, media: MediaAsset | None) -> str | None:
        """Return a static URL or database-media endpoint for one asset."""
        if media is None:
            return None
        if media.storage_kind == "static" and media.static_path:
            return media.static_path
        return f"/api/v1/portfolio/media/{media.id}"

    def _attempt_local_copy(self, media: MediaAsset, data: bytes) -> str | None:
        root = Path(self.settings.media_root)
        destination = root / f"{media.id}-{media.filename}"
        try:
            root.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
        except OSError:
            return None
        return str(destination)

    def _is_referenced(self, media_id: UUID) -> bool:
        draft_references = [
            self.session.exec(
                select(PortfolioSite).where(
                    (PortfolioSite.hero_portrait_media_id == media_id)
                    | (PortfolioSite.profile_media_id == media_id)
                    | (PortfolioSite.consultation_media_id == media_id)
                    | (PortfolioSite.seo_image_media_id == media_id)
                    | (PortfolioSite.brand_logo_light_media_id == media_id)
                    | (PortfolioSite.brand_logo_dark_media_id == media_id)
                    | (PortfolioSite.brand_mark_light_media_id == media_id)
                    | (PortfolioSite.brand_mark_dark_media_id == media_id)
                    | (PortfolioSite.favicon_media_id == media_id)
                    | (PortfolioSite.og_image_media_id == media_id)
                    | (PortfolioSite.twitter_image_media_id == media_id)
                )
            ).first(),
            self.session.exec(select(AboutCard).where(AboutCard.media_id == media_id)).first(),
            self.session.exec(
                select(PortfolioProject).where(PortfolioProject.media_id == media_id)
            ).first(),
            self.session.exec(
                select(PortfolioPost).where(PortfolioPost.cover_media_id == media_id)
            ).first(),
        ]
        if any(draft_references):
            return True
        needle = str(media_id)
        publications = self.session.exec(select(PortfolioPublication.payload)).all()
        return any(needle in json.dumps(payload, sort_keys=True) for payload in publications)


def inspect_image(data: bytes) -> tuple[str, int, int]:
    """Validate image signatures and extract dimensions without decoding pixels."""
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        return "image/png", int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")
    if data.startswith(b"\xff\xd8"):
        width, height = _jpeg_dimensions(data)
        return "image/jpeg", width, height
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        width, height = _webp_dimensions(data)
        return "image/webp", width, height
    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail="Only JPEG, PNG, and WebP images are accepted",
    )


def _jpeg_dimensions(data: bytes) -> tuple[int, int]:
    offset = 2
    start_of_frame = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
    while offset + 9 < len(data):
        if data[offset] != 0xFF:
            offset += 1
            continue
        marker = data[offset + 1]
        offset += 2
        if marker in {0xD8, 0xD9}:
            continue
        if offset + 2 > len(data):
            break
        length = int.from_bytes(data[offset : offset + 2], "big")
        if marker in start_of_frame and offset + 7 < len(data):
            height = int.from_bytes(data[offset + 3 : offset + 5], "big")
            width = int.from_bytes(data[offset + 5 : offset + 7], "big")
            if width > 0 and height > 0:
                return width, height
        if length < 2:
            break
        offset += length
    raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Invalid JPEG")


def _webp_dimensions(data: bytes) -> tuple[int, int]:
    chunk = data[12:16]
    if chunk == b"VP8X" and len(data) >= 30:
        return 1 + int.from_bytes(data[24:27], "little"), 1 + int.from_bytes(data[27:30], "little")
    if chunk == b"VP8 " and len(data) >= 30:
        marker = data.find(b"\x9d\x01\x2a", 20)
        if marker >= 0 and marker + 7 <= len(data):
            width = int.from_bytes(data[marker + 3 : marker + 5], "little") & 0x3FFF
            height = int.from_bytes(data[marker + 5 : marker + 7], "little") & 0x3FFF
            return width, height
    if chunk == b"VP8L" and len(data) >= 25 and data[20] == 0x2F:
        bits = int.from_bytes(data[21:25], "little")
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Invalid WebP")


def _as_utc(value: datetime) -> datetime:
    """Normalize SQLite-naive and PostgreSQL-aware timestamps for conflicts."""
    return value.astimezone(UTC) if value.tzinfo else value.replace(tzinfo=UTC)
