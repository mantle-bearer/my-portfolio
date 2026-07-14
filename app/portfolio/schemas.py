"""Request and response schemas for portfolio CMS APIs."""

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class PortfolioSchema(BaseModel):
    """Base schema configured for SQLModel responses."""

    model_config = ConfigDict(from_attributes=True)


class OptimisticPatch(BaseModel):
    """Optional timestamp used to reject stale admin updates."""

    expected_updated_at: datetime | None = None


class OrderedRead(PortfolioSchema):
    """Fields shared by all ordered CMS records."""

    id: UUID
    sort_order: int
    is_visible: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime


class OrderedCreate(BaseModel):
    """Editable state shared by ordered CMS records."""

    sort_order: int = 0
    is_visible: bool = True


class PortfolioSiteRead(PortfolioSchema):
    """Global draft portfolio settings."""

    id: str
    name: str
    role: str
    public_email: str
    notification_email: str
    hero_summary: str
    hero_primary_label: str
    hero_primary_href: str
    hero_secondary_label: str
    hero_secondary_href: str
    hero_portrait_media_id: UUID | None
    profile_media_id: UUID | None
    about_note_title: str
    about_note_summary: str
    consultation_label: str
    consultation_url: str
    consultation_media_id: UUID | None
    footer_text: str
    seo_title: str
    seo_description: str
    seo_image_media_id: UUID | None
    brand_logo_light_media_id: UUID | None
    brand_logo_dark_media_id: UUID | None
    brand_mark_light_media_id: UUID | None
    brand_mark_dark_media_id: UUID | None
    favicon_media_id: UUID | None
    brand_logo_alt: str
    canonical_url: str
    robots_directive: Literal[
        "index,follow", "index,nofollow", "noindex,follow", "noindex,nofollow"
    ]
    og_title: str
    og_description: str
    og_image_media_id: UUID | None
    twitter_card: Literal["summary", "summary_large_image"]
    twitter_title: str
    twitter_description: str
    twitter_image_media_id: UUID | None
    theme_color: str
    updated_at: datetime


class PortfolioSiteUpdate(OptimisticPatch):
    """Partial update for global draft settings."""

    name: str | None = Field(default=None, min_length=1, max_length=120)
    role: str | None = Field(default=None, min_length=1, max_length=120)
    public_email: EmailStr | None = None
    notification_email: EmailStr | None = None
    hero_summary: str | None = Field(default=None, min_length=1, max_length=1200)
    hero_primary_label: str | None = Field(default=None, min_length=1, max_length=60)
    hero_primary_href: str | None = Field(default=None, min_length=1, max_length=500)
    hero_secondary_label: str | None = Field(default=None, min_length=1, max_length=60)
    hero_secondary_href: str | None = Field(default=None, min_length=1, max_length=500)
    hero_portrait_media_id: UUID | None = None
    profile_media_id: UUID | None = None
    about_note_title: str | None = Field(default=None, min_length=1, max_length=120)
    about_note_summary: str | None = Field(default=None, min_length=1, max_length=1000)
    consultation_label: str | None = Field(default=None, min_length=1, max_length=80)
    consultation_url: str | None = Field(default=None, max_length=500)
    consultation_media_id: UUID | None = None
    footer_text: str | None = Field(default=None, max_length=240)
    seo_title: str | None = Field(default=None, max_length=160)
    seo_description: str | None = Field(default=None, max_length=320)
    seo_image_media_id: UUID | None = None
    brand_logo_light_media_id: UUID | None = None
    brand_logo_dark_media_id: UUID | None = None
    brand_mark_light_media_id: UUID | None = None
    brand_mark_dark_media_id: UUID | None = None
    favicon_media_id: UUID | None = None
    brand_logo_alt: str | None = Field(default=None, min_length=1, max_length=160)
    canonical_url: str | None = Field(default=None, max_length=500)
    robots_directive: Literal[
        "index,follow", "index,nofollow", "noindex,follow", "noindex,nofollow"
    ] | None = None
    og_title: str | None = Field(default=None, max_length=160)
    og_description: str | None = Field(default=None, max_length=320)
    og_image_media_id: UUID | None = None
    twitter_card: Literal["summary", "summary_large_image"] | None = None
    twitter_title: str | None = Field(default=None, max_length=160)
    twitter_description: str | None = Field(default=None, max_length=320)
    twitter_image_media_id: UUID | None = None
    theme_color: str | None = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")


class SectionSettingRead(PortfolioSchema):
    """Editable section heading and navigation metadata."""

    key: str
    heading: str
    navigation_label: str
    summary: str | None
    is_visible: bool
    updated_at: datetime


class SectionSettingUpdate(OptimisticPatch):
    """Partial section-setting update."""

    heading: str | None = Field(default=None, min_length=1, max_length=120)
    navigation_label: str | None = Field(default=None, min_length=1, max_length=40)
    summary: str | None = Field(default=None, max_length=500)
    is_visible: bool | None = None


class HeroExpertiseCreate(OrderedCreate):
    """Create one hero expertise entry."""

    label: str = Field(min_length=1, max_length=80)
    icon_key: str = Field(min_length=1, max_length=40)


class HeroExpertiseUpdate(OptimisticPatch):
    """Update one hero expertise entry."""

    label: str | None = Field(default=None, min_length=1, max_length=80)
    icon_key: str | None = Field(default=None, min_length=1, max_length=40)
    sort_order: int | None = None
    is_visible: bool | None = None


class HeroExpertiseRead(OrderedRead):
    """Hero expertise response."""

    label: str
    icon_key: str


class SocialLinkCreate(OrderedCreate):
    """Create one social link."""

    platform: str = Field(min_length=1, max_length=60)
    label: str = Field(min_length=1, max_length=100)
    url: str = Field(min_length=1, max_length=500)
    icon_key: str = Field(min_length=1, max_length=40)


class SocialLinkUpdate(OptimisticPatch):
    """Update one social link."""

    platform: str | None = Field(default=None, min_length=1, max_length=60)
    label: str | None = Field(default=None, min_length=1, max_length=100)
    url: str | None = Field(default=None, min_length=1, max_length=500)
    icon_key: str | None = Field(default=None, min_length=1, max_length=40)
    sort_order: int | None = None
    is_visible: bool | None = None


class SocialLinkRead(OrderedRead):
    """Social-link response."""

    platform: str
    label: str
    url: str
    icon_key: str


class AboutCardCreate(OrderedCreate):
    """Create one About bento card."""

    title: str = Field(min_length=1, max_length=120)
    summary: str = Field(min_length=1, max_length=1600)
    media_id: UUID | None = None
    image_alt: str = Field(default="", max_length=240)
    layout: Literal["tall", "wide", "small"] = "small"
    tone: Literal["navy", "white", "blue", "orange"] = "white"
    image_fit: Literal["contain", "cover"] = "contain"
    image_ratio: Literal["portrait", "landscape"] | None = None


class AboutCardUpdate(OptimisticPatch):
    """Update one About bento card."""

    title: str | None = Field(default=None, min_length=1, max_length=120)
    summary: str | None = Field(default=None, min_length=1, max_length=1600)
    media_id: UUID | None = None
    image_alt: str | None = Field(default=None, max_length=240)
    layout: Literal["tall", "wide", "small"] | None = None
    tone: Literal["navy", "white", "blue", "orange"] | None = None
    image_fit: Literal["contain", "cover"] | None = None
    image_ratio: Literal["portrait", "landscape"] | None = None
    sort_order: int | None = None
    is_visible: bool | None = None


class AboutCardRead(OrderedRead):
    """About-card response."""

    title: str
    summary: str
    media_id: UUID | None
    image_alt: str
    layout: str
    tone: str
    image_fit: str
    image_ratio: str | None


class StackUseCase(BaseModel):
    """Compact stack use case shown beneath a code sample."""

    title: str = Field(min_length=1, max_length=100)
    summary: str = Field(min_length=1, max_length=300)


class TechnologyStackCreate(OrderedCreate):
    """Create one technology stack."""

    language: str = Field(min_length=1, max_length=80)
    summary: str = Field(min_length=1, max_length=800)
    code_snippet: str = Field(min_length=1, max_length=10000)
    tools: list[str] = Field(default_factory=list, max_length=20)
    use_cases: list[StackUseCase] = Field(default_factory=list, max_length=8)


class TechnologyStackUpdate(OptimisticPatch):
    """Update one technology stack."""

    language: str | None = Field(default=None, min_length=1, max_length=80)
    summary: str | None = Field(default=None, min_length=1, max_length=800)
    code_snippet: str | None = Field(default=None, min_length=1, max_length=10000)
    tools: list[str] | None = Field(default=None, max_length=20)
    use_cases: list[StackUseCase] | None = Field(default=None, max_length=8)
    sort_order: int | None = None
    is_visible: bool | None = None


class TechnologyStackRead(OrderedRead):
    """Technology-stack response."""

    language: str
    summary: str
    code_snippet: str
    tools: list[str]
    use_cases: list[dict[str, str]]


class PortfolioServiceCreate(OrderedCreate):
    """Create one offered service."""

    title: str = Field(min_length=1, max_length=120)
    summary: str = Field(min_length=1, max_length=800)
    icon_key: str = Field(default="code", max_length=40)


class PortfolioServiceUpdate(OptimisticPatch):
    """Update one offered service."""

    title: str | None = Field(default=None, min_length=1, max_length=120)
    summary: str | None = Field(default=None, min_length=1, max_length=800)
    icon_key: str | None = Field(default=None, max_length=40)
    sort_order: int | None = None
    is_visible: bool | None = None


class PortfolioServiceRead(OrderedRead):
    """Service response."""

    title: str
    summary: str
    icon_key: str


class PortfolioProjectCreate(OrderedCreate):
    """Create one project or case study."""

    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=1, max_length=160)
    summary: str = Field(min_length=1, max_length=1200)
    case_study_markdown: str = Field(default="", max_length=100000)
    tags: list[str] = Field(default_factory=list, max_length=20)
    media_id: UUID | None = None
    external_url: str | None = Field(default=None, max_length=500)
    live_url: str | None = Field(default=None, max_length=500)
    repository_url: str | None = Field(default=None, max_length=500)
    is_featured: bool = False
    seo_title: str = Field(default="", max_length=160)
    seo_description: str = Field(default="", max_length=320)


class PortfolioProjectUpdate(OptimisticPatch):
    """Update one project or case study."""

    slug: str | None = Field(
        default=None, min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
    )
    title: str | None = Field(default=None, min_length=1, max_length=160)
    summary: str | None = Field(default=None, min_length=1, max_length=1200)
    case_study_markdown: str | None = Field(default=None, max_length=100000)
    tags: list[str] | None = Field(default=None, max_length=20)
    media_id: UUID | None = None
    external_url: str | None = Field(default=None, max_length=500)
    live_url: str | None = Field(default=None, max_length=500)
    repository_url: str | None = Field(default=None, max_length=500)
    is_featured: bool | None = None
    seo_title: str | None = Field(default=None, max_length=160)
    seo_description: str | None = Field(default=None, max_length=320)
    sort_order: int | None = None
    is_visible: bool | None = None


class PortfolioProjectRead(OrderedRead):
    """Project response."""

    slug: str
    title: str
    summary: str
    case_study_markdown: str
    tags: list[str]
    media_id: UUID | None
    external_url: str | None
    live_url: str | None
    repository_url: str | None
    is_featured: bool
    seo_title: str
    seo_description: str


class PostCategoryCreate(OrderedCreate):
    """Create one post category."""

    name: str = Field(min_length=1, max_length=80)
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class PostCategoryUpdate(OptimisticPatch):
    """Update one post category."""

    name: str | None = Field(default=None, min_length=1, max_length=80)
    slug: str | None = Field(
        default=None, min_length=1, max_length=80, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
    )
    sort_order: int | None = None
    is_visible: bool | None = None


class PostCategoryRead(OrderedRead):
    """Post-category response."""

    name: str
    slug: str


class PortfolioPostCreate(OrderedCreate):
    """Create one Markdown post."""

    category_id: UUID
    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=1, max_length=200)
    excerpt: str = Field(min_length=1, max_length=1200)
    body_markdown: str = Field(default="", max_length=200000)
    cover_media_id: UUID | None = None
    published_on: datetime | None = None
    seo_title: str = Field(default="", max_length=160)
    seo_description: str = Field(default="", max_length=320)


class PortfolioPostUpdate(OptimisticPatch):
    """Update one Markdown post."""

    category_id: UUID | None = None
    slug: str | None = Field(
        default=None, min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
    )
    title: str | None = Field(default=None, min_length=1, max_length=200)
    excerpt: str | None = Field(default=None, min_length=1, max_length=1200)
    body_markdown: str | None = Field(default=None, max_length=200000)
    cover_media_id: UUID | None = None
    published_on: datetime | None = None
    seo_title: str | None = Field(default=None, max_length=160)
    seo_description: str | None = Field(default=None, max_length=320)
    sort_order: int | None = None
    is_visible: bool | None = None


class PortfolioPostRead(OrderedRead):
    """Post response."""

    category_id: UUID
    slug: str
    title: str
    excerpt: str
    body_markdown: str
    cover_media_id: UUID | None
    published_on: datetime | None
    seo_title: str
    seo_description: str


class CollectionOrderUpdate(BaseModel):
    """Atomic ordered-ID replacement for one collection."""

    ids: list[UUID] = Field(min_length=1)


class MediaAssetRead(PortfolioSchema):
    """Media metadata without binary bytes."""

    id: UUID
    filename: str
    mime_type: str
    size_bytes: int
    width: int | None
    height: int | None
    checksum: str
    alt_text: str
    storage_kind: str
    static_path: str | None
    local_path: str | None
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    url: str | None = None


class MediaAssetUpdate(OptimisticPatch):
    """Editable media metadata."""

    filename: str | None = Field(default=None, min_length=1, max_length=255)
    alt_text: str | None = Field(default=None, max_length=300)
    is_archived: bool | None = None


class ContactCreate(BaseModel):
    """Public contact enquiry including an invisible bot trap."""

    name: str = Field(min_length=1, max_length=120)
    email: EmailStr = Field(max_length=320)
    subject: str = Field(min_length=1, max_length=180)
    message: str = Field(min_length=1, max_length=5000)
    website: str = Field(default="", max_length=0)

    @field_validator("name", "subject", "message")
    @classmethod
    def reject_control_characters(cls, value: str) -> str:
        """Reject hidden control characters and normalize surrounding whitespace."""
        normalized = value.strip()
        if not normalized:
            raise ValueError("This field cannot be blank")
        if any(ord(character) < 32 and character not in "\n\r\t" for character in normalized):
            raise ValueError("Control characters are not allowed")
        return normalized


class ContactAccepted(BaseModel):
    """Non-sensitive public acknowledgement for a stored enquiry."""

    status: Literal["accepted"] = "accepted"


class ContactSubmissionRead(PortfolioSchema):
    """Contact inbox response."""

    id: UUID
    name: str
    email: str
    subject: str
    message: str
    inbox_state: str
    delivery_state: str
    delivery_attempts: int
    last_delivery_at: datetime | None
    delivered_at: datetime | None
    delivery_error: str | None
    is_archived: bool
    created_at: datetime
    updated_at: datetime


class ContactSubmissionUpdate(OptimisticPatch):
    """Update inbox state or archive status."""

    inbox_state: Literal["new", "read", "replied", "spam", "archived"] | None = None
    is_archived: bool | None = None


class PortfolioPublicationRead(PortfolioSchema):
    """Publication history metadata."""

    id: UUID
    version: int
    checksum: str
    published_by_id: UUID
    restored_from_id: UUID | None
    published_at: datetime


class PortfolioContentResponse(BaseModel):
    """Published or preview aggregate response."""

    publication: PortfolioPublicationRead | None = None
    content: dict[str, Any] | None = None
    source: Literal["published", "draft", "none"]


class PublishedPostSummary(BaseModel):
    """Post list item from the current publication."""

    slug: str
    title: str
    excerpt: str
    category: str
    date: str
    href: str


class PublishedPostDetail(PublishedPostSummary):
    """Full post detail from the current publication."""

    body_markdown: str
    cover_image: str | None = None
    seo_title: str = ""
    seo_description: str = ""


class PublishedProjectDetail(BaseModel):
    """Full internal project case study from the current publication."""

    slug: str
    title: str
    summary: str
    case_study_markdown: str
    tags: list[str]
    image: str | None = None
    live_url: str | None = None
    repository_url: str | None = None
    seo_title: str = ""
    seo_description: str = ""


class Message(BaseModel):
    """Simple portfolio domain operation response."""

    message: str
