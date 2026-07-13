"""Database models for the portfolio content management domain."""

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import JSON, Column, DateTime, LargeBinary, Text
from sqlmodel import Field, SQLModel

from app.models import utcnow


class OrderedPortfolioRecord(SQLModel):
    """Shared fields for ordered, soft-archived portfolio records."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    sort_order: int = Field(default=0, index=True)
    is_visible: bool = True
    is_archived: bool = Field(default=False, index=True)
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
    )


class PortfolioSite(SQLModel, table=True):
    """Singleton draft record for global portfolio content."""

    __tablename__ = "portfolio_site"

    id: str = Field(default="default", primary_key=True)
    name: str = ""
    role: str = ""
    public_email: str = ""
    notification_email: str = ""
    hero_summary: str = Field(default="", sa_column=Column(Text, nullable=False))
    hero_primary_label: str = "View my work"
    hero_primary_href: str = "#projects"
    hero_secondary_label: str = "Get in touch"
    hero_secondary_href: str = "#contact"
    hero_portrait_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    profile_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    about_note_title: str = "about-summary.sh"
    about_note_summary: str = Field(default="", sa_column=Column(Text, nullable=False))
    consultation_label: str = "Book for Consultation"
    consultation_url: str = ""
    consultation_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    footer_text: str = ""
    seo_title: str = ""
    seo_description: str = Field(default="", sa_column=Column(Text, nullable=False))
    seo_image_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    brand_logo_light_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    brand_logo_dark_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    brand_mark_light_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    brand_mark_dark_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    favicon_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    brand_logo_alt: str = "Goodluck Igbokwe"
    canonical_url: str = ""
    robots_directive: str = "index,follow"
    og_title: str = ""
    og_description: str = Field(default="", sa_column=Column(Text, nullable=False))
    og_image_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    twitter_card: str = "summary_large_image"
    twitter_title: str = ""
    twitter_description: str = Field(default="", sa_column=Column(Text, nullable=False))
    twitter_image_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    theme_color: str = "#06245a"
    updated_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
    )


class PortfolioSectionSetting(SQLModel, table=True):
    """Editable text and visibility for a code-owned portfolio section."""

    __tablename__ = "portfolio_section_setting"

    key: str = Field(primary_key=True, max_length=40)
    heading: str
    navigation_label: str
    summary: str | None = Field(default=None, sa_column=Column(Text))
    is_visible: bool = True
    updated_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
    )


class HeroExpertise(OrderedPortfolioRecord, table=True):
    """Technology shown in the hero expertise row."""

    __tablename__ = "hero_expertise"

    label: str
    icon_key: str


class SocialLink(OrderedPortfolioRecord, table=True):
    """Public profile or contact link."""

    __tablename__ = "social_link"

    platform: str
    label: str
    url: str
    icon_key: str


class AboutCard(OrderedPortfolioRecord, table=True):
    """One card in the code-owned About bento layout."""

    __tablename__ = "about_card"

    title: str
    summary: str = Field(sa_column=Column(Text, nullable=False))
    media_id: UUID | None = Field(default=None, foreign_key="media_asset.id", ondelete="SET NULL")
    image_alt: str = ""
    layout: str = "small"
    tone: str = "white"
    image_fit: str = "contain"
    image_ratio: str | None = None


class TechnologyStack(OrderedPortfolioRecord, table=True):
    """Language, code sample, tools, and use cases for the stacks section."""

    __tablename__ = "technology_stack"

    language: str = Field(index=True, unique=True)
    summary: str = Field(sa_column=Column(Text, nullable=False))
    code_snippet: str = Field(sa_column=Column(Text, nullable=False))
    tools: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    use_cases: list[dict[str, str]] = Field(
        default_factory=list, sa_column=Column(JSON, nullable=False)
    )


class PortfolioService(OrderedPortfolioRecord, table=True):
    """Service offered through the public portfolio."""

    __tablename__ = "portfolio_service"

    title: str
    summary: str = Field(sa_column=Column(Text, nullable=False))
    icon_key: str = "code"


class PortfolioProject(OrderedPortfolioRecord, table=True):
    """Project card and optional internal case study."""

    __tablename__ = "portfolio_project"

    slug: str = Field(index=True, unique=True)
    title: str
    summary: str = Field(sa_column=Column(Text, nullable=False))
    case_study_markdown: str = Field(default="", sa_column=Column(Text, nullable=False))
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    media_id: UUID | None = Field(default=None, foreign_key="media_asset.id", ondelete="SET NULL")
    external_url: str | None = None
    live_url: str | None = None
    repository_url: str | None = None
    is_featured: bool = False
    seo_title: str = ""
    seo_description: str = Field(default="", sa_column=Column(Text, nullable=False))


class PostCategory(OrderedPortfolioRecord, table=True):
    """Filterable category for portfolio posts."""

    __tablename__ = "post_category"

    name: str = Field(index=True, unique=True)
    slug: str = Field(index=True, unique=True)


class PortfolioPost(OrderedPortfolioRecord, table=True):
    """Long-form portfolio post authored as Markdown."""

    __tablename__ = "portfolio_post"

    category_id: UUID = Field(foreign_key="post_category.id", index=True)
    slug: str = Field(index=True, unique=True)
    title: str
    excerpt: str = Field(sa_column=Column(Text, nullable=False))
    body_markdown: str = Field(default="", sa_column=Column(Text, nullable=False))
    cover_media_id: UUID | None = Field(
        default=None, foreign_key="media_asset.id", ondelete="SET NULL"
    )
    published_on: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )
    seo_title: str = ""
    seo_description: str = Field(default="", sa_column=Column(Text, nullable=False))


class MediaAsset(SQLModel, table=True):
    """Static or database-backed media used by portfolio content."""

    __tablename__ = "media_asset"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    filename: str
    mime_type: str
    size_bytes: int = 0
    width: int | None = None
    height: int | None = None
    checksum: str = Field(index=True)
    alt_text: str = ""
    storage_kind: str = "database"
    byte_data: bytes | None = Field(default=None, sa_column=Column(LargeBinary))
    static_path: str | None = None
    local_path: str | None = None
    created_by_id: UUID | None = Field(default=None, foreign_key="user.id", ondelete="SET NULL")
    is_archived: bool = Field(default=False, index=True)
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
    )


class ContactSubmission(SQLModel, table=True):
    """Stored public enquiry and owner-email delivery state."""

    __tablename__ = "contact_submission"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    email: str = Field(index=True)
    subject: str
    message: str = Field(sa_column=Column(Text, nullable=False))
    inbox_state: str = Field(default="new", index=True)
    delivery_state: str = Field(default="pending", index=True)
    delivery_attempts: int = 0
    last_delivery_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )
    delivered_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )
    delivery_error: str | None = Field(default=None, sa_column=Column(Text))
    is_archived: bool = Field(default=False, index=True)
    created_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
    )


class PortfolioPublication(SQLModel, table=True):
    """Immutable validated snapshot of the complete public portfolio."""

    __tablename__ = "portfolio_publication"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    version: int = Field(index=True, unique=True)
    payload: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))
    checksum: str = Field(index=True)
    published_by_id: UUID = Field(foreign_key="user.id")
    restored_from_id: UUID | None = Field(
        default=None, foreign_key="portfolio_publication.id", ondelete="SET NULL"
    )
    published_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
        index=True,
    )


class PortfolioState(SQLModel, table=True):
    """Singleton pointer to the currently public immutable snapshot."""

    __tablename__ = "portfolio_state"

    id: str = Field(default="default", primary_key=True)
    current_publication_id: UUID | None = Field(
        default=None, foreign_key="portfolio_publication.id", ondelete="SET NULL"
    )
    updated_at: datetime = Field(
        default_factory=utcnow,
        sa_type=DateTime(timezone=True),
    )
