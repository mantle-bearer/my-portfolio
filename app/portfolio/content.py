"""Draft content service for the portfolio CMS."""

from datetime import UTC, datetime
from typing import Any, TypeVar
from uuid import UUID

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, SQLModel, select

from app.portfolio.models import (
    AboutCard,
    HeroExpertise,
    MediaAsset,
    PortfolioPost,
    PortfolioProject,
    PortfolioSectionSetting,
    PortfolioService,
    PortfolioSite,
    PostCategory,
    SocialLink,
    TechnologyStack,
)

RecordT = TypeVar("RecordT", bound=SQLModel)

COLLECTION_MODELS: dict[str, type[SQLModel]] = {
    "expertise": HeroExpertise,
    "social-links": SocialLink,
    "about-cards": AboutCard,
    "stacks": TechnologyStack,
    "services": PortfolioService,
    "projects": PortfolioProject,
    "categories": PostCategory,
    "posts": PortfolioPost,
}

ALLOWED_ICON_KEYS = {
    "api",
    "code",
    "database",
    "django",
    "email",
    "fastapi",
    "github",
    "laravel",
    "layers",
    "linkedin",
    "performance",
    "php",
    "python",
    "react",
    "shield",
    "typescript",
    "workflow",
}


class PortfolioContentService:
    """Own validation and persistence for the editable draft workspace."""

    def __init__(self, session: Session):
        """Initialize the service with a request-scoped session."""
        self.session = session

    def get_site(self) -> PortfolioSite:
        """Return the required singleton draft site."""
        site = self.session.get(PortfolioSite, "default")
        if site is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio draft has not been initialized",
            )
        return site

    def update_site(self, body: BaseModel) -> PortfolioSite:
        """Apply a conflict-aware partial site update."""
        site = self.get_site()
        values = self._validated_values(site, body)
        self._validate_media_fields(values)
        self._validate_links(values)
        return self._save(site, values)

    def get_section(self, key: str) -> PortfolioSectionSetting:
        """Return one fixed section setting."""
        section = self.session.get(PortfolioSectionSetting, key)
        if section is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
        return section

    def update_section(self, key: str, body: BaseModel) -> PortfolioSectionSetting:
        """Update one fixed section without changing code-owned order."""
        section = self.get_section(key)
        return self._save(section, self._validated_values(section, body))

    def list_records(self, model: type[RecordT], include_archived: bool = False) -> list[RecordT]:
        """List one portfolio collection in stable draft order."""
        statement = select(model)
        if not include_archived:
            statement = statement.where(model.is_archived.is_(False))  # type: ignore[attr-defined]
        statement = statement.order_by(model.sort_order, model.created_at)  # type: ignore[attr-defined]
        return list(self.session.exec(statement).all())

    def get_record(self, model: type[RecordT], record_id: UUID) -> RecordT:
        """Return one portfolio collection record."""
        record = self.session.get(model, record_id)
        if record is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
        return record

    def create_record(self, model: type[RecordT], body: BaseModel) -> RecordT:
        """Validate and create one collection record."""
        values = body.model_dump(mode="python")
        self._validate_record_values(model, values)
        record = model(**values)
        self.session.add(record)
        self._commit_unique()
        self.session.refresh(record)
        return record

    def update_record(self, model: type[RecordT], record_id: UUID, body: BaseModel) -> RecordT:
        """Validate and update one collection record."""
        record = self.get_record(model, record_id)
        values = self._validated_values(record, body)
        self._validate_record_values(model, values)
        return self._save(record, values)

    def archive_record(self, model: type[RecordT], record_id: UUID) -> RecordT:
        """Soft-archive one record while preserving publication history."""
        record = self.get_record(model, record_id)
        if model is PostCategory:
            linked_post = self.session.exec(
                select(PortfolioPost).where(
                    PortfolioPost.category_id == record_id,
                    PortfolioPost.is_archived.is_(False),
                )
            ).first()
            if linked_post:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Archive posts in this category first",
                )
        record.is_archived = True  # type: ignore[attr-defined]
        record.is_visible = False  # type: ignore[attr-defined]
        record.updated_at = datetime.now(UTC)  # type: ignore[attr-defined]
        self.session.add(record)
        self.session.commit()
        self.session.refresh(record)
        return record

    def reorder(self, model: type[RecordT], ids: list[UUID]) -> list[RecordT]:
        """Replace collection order atomically after validating every active ID."""
        records = self.list_records(model)
        current_ids = {record.id for record in records}  # type: ignore[attr-defined]
        if len(ids) != len(set(ids)) or set(ids) != current_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order must contain every active record exactly once",
            )
        by_id = {record.id: record for record in records}  # type: ignore[attr-defined]
        now = datetime.now(UTC)
        for index, record_id in enumerate(ids):
            record = by_id[record_id]
            record.sort_order = index  # type: ignore[attr-defined]
            record.updated_at = now  # type: ignore[attr-defined]
            self.session.add(record)
        self.session.commit()
        return self.list_records(model)

    def _validated_values(self, record: SQLModel, body: BaseModel) -> dict[str, Any]:
        values = body.model_dump(exclude_unset=True, mode="python")
        expected = values.pop("expected_updated_at", None)
        current = getattr(record, "updated_at", None)
        if expected is not None and current is not None:
            expected_utc = (
                expected.astimezone(UTC) if expected.tzinfo else expected.replace(tzinfo=UTC)
            )
            current_utc = current.astimezone(UTC) if current.tzinfo else current.replace(tzinfo=UTC)
            if expected_utc != current_utc:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This content changed after it was opened",
                )
        return values

    def _validate_record_values(self, model: type[SQLModel], values: dict[str, Any]) -> None:
        if "icon_key" in values and values["icon_key"] not in ALLOWED_ICON_KEYS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Unsupported icon key",
            )
        self._validate_links(values)
        self._validate_media_fields(values)
        if model is PortfolioPost and "category_id" in values:
            category = self.session.get(PostCategory, values["category_id"])
            if category is None or category.is_archived:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="Post category is unavailable",
                )

    def _validate_links(self, values: dict[str, Any]) -> None:
        for field, value in values.items():
            if not value or not field.endswith(("url", "href")):
                continue
            if not str(value).startswith(("https://", "http://", "mailto:", "#", "/")):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"{field} must use an approved URL scheme",
                )

    def _validate_media_fields(self, values: dict[str, Any]) -> None:
        for field, value in values.items():
            if not field.endswith("media_id") or value is None:
                continue
            media = self.session.get(MediaAsset, value)
            if media is None or media.is_archived:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"{field} references unavailable media",
                )

    def _save(self, record: RecordT, values: dict[str, Any]) -> RecordT:
        for field, value in values.items():
            setattr(record, field, value)
        if hasattr(record, "updated_at"):
            record.updated_at = datetime.now(UTC)  # type: ignore[attr-defined]
        self.session.add(record)
        self._commit_unique()
        self.session.refresh(record)
        return record

    def _commit_unique(self) -> None:
        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A record with that unique value already exists",
            ) from exc
