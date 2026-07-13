"""Draft composition, immutable publication, preview, and restore services."""

import hashlib
import json
from copy import deepcopy
from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select

from app.models import User
from app.portfolio.media import MediaService
from app.portfolio.models import (
    AboutCard,
    HeroExpertise,
    MediaAsset,
    PortfolioPost,
    PortfolioProject,
    PortfolioPublication,
    PortfolioSectionSetting,
    PortfolioService,
    PortfolioSite,
    PortfolioState,
    PostCategory,
    SocialLink,
    TechnologyStack,
)
from app.portfolio.schemas import (
    PortfolioContentResponse,
    PortfolioPublicationRead,
    PublishedPostDetail,
    PublishedPostSummary,
    PublishedProjectDetail,
)

SECTION_ORDER = ("home", "about", "stacks", "services", "projects", "notes", "contact")


class PortfolioPublishingService:
    """Compose the draft and manage the public immutable snapshot pointer."""

    def __init__(self, session: Session, media_service: MediaService):
        """Initialize publishing with draft and media access."""
        self.session = session
        self.media_service = media_service

    def preview(self) -> PortfolioContentResponse:
        """Return the current draft aggregate without changing public state."""
        content = self.compose_draft()
        return PortfolioContentResponse(publication=None, content=content, source="draft")

    def current(self) -> PortfolioContentResponse:
        """Return the current public aggregate or an explicit empty state."""
        publication = self.current_publication()
        if publication is None:
            return PortfolioContentResponse(publication=None, content=None, source="none")
        return PortfolioContentResponse(
            publication=PortfolioPublicationRead.model_validate(publication),
            content=publication.payload,
            source="published",
        )

    def publish(self, user: User) -> PortfolioPublication:
        """Validate and atomically publish one complete immutable draft snapshot."""
        payload = self.compose_draft()
        self._validate_payload(payload)
        return self._create_publication(payload, user.id)

    def restore(self, publication_id: UUID, user: User) -> PortfolioPublication:
        """Restore history by creating a new immutable version from an old payload."""
        source = self.session.get(PortfolioPublication, publication_id)
        if source is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Publication not found"
            )
        payload = deepcopy(source.payload)
        self._validate_payload(payload)
        return self._create_publication(payload, user.id, restored_from_id=source.id)

    def list_publications(self) -> list[PortfolioPublication]:
        """List immutable publication history newest first."""
        statement = select(PortfolioPublication).order_by(PortfolioPublication.version.desc())
        return list(self.session.exec(statement).all())

    def current_publication(self) -> PortfolioPublication | None:
        """Resolve the singleton current-publication pointer."""
        state = self.session.get(PortfolioState, "default")
        if state is None or state.current_publication_id is None:
            return None
        return self.session.get(PortfolioPublication, state.current_publication_id)

    def published_posts(self) -> list[PublishedPostSummary]:
        """Return post summaries from the current snapshot."""
        payload = self._required_public_payload()
        return [PublishedPostSummary.model_validate(post) for post in payload.get("notes", [])]

    def published_post(self, slug: str) -> PublishedPostDetail:
        """Return one post from the current snapshot."""
        payload = self._required_public_payload()
        for post in payload.get("notes", []):
            if post.get("slug") == slug:
                return PublishedPostDetail.model_validate(post)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    def published_project(self, slug: str) -> PublishedProjectDetail:
        """Return one internal project case study from the current snapshot."""
        payload = self._required_public_payload()
        for project in payload.get("projects", []):
            if project.get("slug") == slug:
                return PublishedProjectDetail.model_validate(project)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    def compose_draft(self) -> dict[str, object]:
        """Compose normalized draft tables into the frontend portfolio contract."""
        site = self.session.get(PortfolioSite, "default")
        if site is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Portfolio draft has not been initialized",
            )

        sections = {
            item.key: item for item in self.session.exec(select(PortfolioSectionSetting)).all()
        }
        media = {
            item.id: item
            for item in self.session.exec(
                select(MediaAsset).where(MediaAsset.is_archived.is_(False))
            ).all()
        }
        categories = {item.id: item for item in self._visible(PostCategory)}

        social_links = [
            {
                "platform": link.platform,
                "label": link.label,
                "href": link.url,
                "iconKey": link.icon_key,
            }
            for link in self._visible(SocialLink)
        ]
        expertise = [
            {"label": item.label, "iconKey": item.icon_key} for item in self._visible(HeroExpertise)
        ]
        about_cards = [
            {
                "id": str(card.id),
                "title": card.title,
                "summary": card.summary,
                "image": self._media_url(media.get(card.media_id)),
                "imageAlt": card.image_alt,
                "layout": card.layout,
                "tone": card.tone,
                "imageFit": card.image_fit,
                "imageRatio": card.image_ratio,
            }
            for card in self._visible(AboutCard)
        ]
        stacks = [
            {
                "id": str(stack.id),
                "language": stack.language,
                "summary": stack.summary,
                "tools": stack.tools,
                "snippet": stack.code_snippet.splitlines(),
                "useCases": stack.use_cases,
            }
            for stack in self._visible(TechnologyStack)
        ]
        services = [
            {
                "id": str(service.id),
                "title": service.title,
                "summary": service.summary,
                "iconKey": service.icon_key,
            }
            for service in self._visible(PortfolioService)
        ]
        projects = [
            {
                "id": str(project.id),
                "slug": project.slug,
                "title": project.title,
                "summary": project.summary,
                "case_study_markdown": project.case_study_markdown,
                "tags": project.tags,
                "image": self._media_url(media.get(project.media_id)),
                "href": project.external_url or f"/projects/{project.slug}",
                "external_url": project.external_url,
                "live_url": project.live_url,
                "repository_url": project.repository_url,
                "featured": project.is_featured,
                "seo_title": project.seo_title,
                "seo_description": project.seo_description,
            }
            for project in self._visible(PortfolioProject)
        ]
        posts = [
            {
                "id": str(post.id),
                "slug": post.slug,
                "title": post.title,
                "category": categories[post.category_id].name,
                "categorySlug": categories[post.category_id].slug,
                "excerpt": post.excerpt,
                "body_markdown": post.body_markdown,
                "date": self._post_date(post),
                "href": f"/blog/{post.slug}",
                "cover_image": self._media_url(media.get(post.cover_media_id)),
                "seo_title": post.seo_title,
                "seo_description": post.seo_description,
            }
            for post in self._visible(PortfolioPost)
            if post.category_id in categories
        ]
        navigation = [
            {
                "key": key,
                "label": sections[key].navigation_label,
                "href": f"#{key}",
                "isVisible": sections[key].is_visible,
            }
            for key in SECTION_ORDER
            if key in sections
        ]

        return {
            "profile": {
                "name": site.name,
                "role": site.role,
                "email": site.public_email,
                "heroTitle": {"name": site.name},
                "heroSummary": site.hero_summary,
                "heroPrimaryAction": {
                    "label": site.hero_primary_label,
                    "href": site.hero_primary_href,
                },
                "heroSecondaryAction": {
                    "label": site.hero_secondary_label,
                    "href": site.hero_secondary_href,
                },
                "socialLinks": social_links,
            },
            "assets": {
                "heroPortrait": self._asset_payload(media.get(site.hero_portrait_media_id)),
                "profilePortrait": self._asset_payload(media.get(site.profile_media_id)),
                "consultationCard": self._asset_payload(media.get(site.consultation_media_id)),
            },
            "sections": {
                key: {
                    "heading": section.heading,
                    "navigationLabel": section.navigation_label,
                    "summary": section.summary,
                    "isVisible": section.is_visible,
                }
                for key, section in sections.items()
            },
            "navigation": navigation,
            "heroExpertise": expertise,
            "aboutCards": about_cards,
            "aboutSummaryNote": {
                "title": site.about_note_title,
                "summary": site.about_note_summary,
            },
            "stacks": stacks,
            "services": services,
            "projects": projects,
            "noteCategories": ["All", *[item.name for item in categories.values()]],
            "notes": posts,
            "consultation": {
                "label": site.consultation_label,
                "url": site.consultation_url,
            },
            "footerText": site.footer_text,
            "seo": {
                "title": site.seo_title,
                "description": site.seo_description,
                "image": self._media_url(
                    media.get(site.og_image_media_id or site.seo_image_media_id)
                ),
                "canonicalUrl": site.canonical_url,
                "robots": site.robots_directive,
                "ogTitle": site.og_title or site.seo_title,
                "ogDescription": site.og_description or site.seo_description,
                "twitterCard": site.twitter_card,
                "twitterTitle": site.twitter_title or site.seo_title,
                "twitterDescription": site.twitter_description or site.seo_description,
                "twitterImage": self._media_url(
                    media.get(
                        site.twitter_image_media_id
                        or site.og_image_media_id
                        or site.seo_image_media_id
                    )
                ),
                "themeColor": site.theme_color,
            },
            "branding": {
                "name": site.name,
                "logoAlt": site.brand_logo_alt,
                "logoLight": self._asset_payload(media.get(site.brand_logo_light_media_id)),
                "logoDark": self._asset_payload(media.get(site.brand_logo_dark_media_id)),
                "markLight": self._asset_payload(media.get(site.brand_mark_light_media_id)),
                "markDark": self._asset_payload(media.get(site.brand_mark_dark_media_id)),
                "favicon": self._asset_payload(media.get(site.favicon_media_id)),
            },
        }

    def _visible(self, model: type[object]) -> list[object]:
        statement = (
            select(model)
            .where(model.is_archived.is_(False), model.is_visible.is_(True))
            .order_by(model.sort_order, model.created_at)
        )
        return list(self.session.exec(statement).all())

    def _asset_payload(self, media: MediaAsset | None) -> dict[str, str]:
        return {
            "src": self._media_url(media) or "",
            "alt": media.alt_text if media else "",
        }

    def _media_url(self, media: MediaAsset | None) -> str | None:
        return self.media_service.public_url(media)

    @staticmethod
    def _post_date(post: PortfolioPost) -> str:
        timestamp = post.published_on or post.created_at
        return (
            timestamp.astimezone(UTC).date().isoformat()
            if timestamp.tzinfo
            else timestamp.date().isoformat()
        )

    def _create_publication(
        self,
        payload: dict[str, object],
        user_id: UUID,
        restored_from_id: UUID | None = None,
    ) -> PortfolioPublication:
        current_version = (
            self.session.exec(select(func.max(PortfolioPublication.version))).one() or 0
        )
        encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        publication = PortfolioPublication(
            version=current_version + 1,
            payload=payload,
            checksum=hashlib.sha256(encoded).hexdigest(),
            published_by_id=user_id,
            restored_from_id=restored_from_id,
        )
        state = self.session.get(PortfolioState, "default") or PortfolioState()
        try:
            self.session.add(publication)
            self.session.flush()
            state.current_publication_id = publication.id
            state.updated_at = datetime.now(UTC)
            self.session.add(state)
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise
        self.session.refresh(publication)
        return publication

    @staticmethod
    def _validate_payload(payload: dict[str, object]) -> None:
        profile = payload.get("profile")
        if not isinstance(profile, dict):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Profile missing"
            )
        required = ("name", "role", "email", "heroSummary")
        missing = [key for key in required if not str(profile.get(key, "")).strip()]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Required profile content missing: {', '.join(missing)}",
            )
        for collection in ("aboutCards", "stacks", "services", "projects", "notes"):
            if not payload.get(collection):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"At least one visible {collection} record is required",
                )
        PortfolioPublishingService._validate_public_links(payload)

    @staticmethod
    def _validate_public_links(value: object, field: str = "content") -> None:
        """Reject unsafe link schemes even if draft data bypassed normal write validation."""
        if isinstance(value, dict):
            for key, item in value.items():
                PortfolioPublishingService._validate_public_links(item, key)
            return
        if isinstance(value, list):
            for item in value:
                PortfolioPublishingService._validate_public_links(item, field)
            return
        is_link = field.endswith(("url", "href")) or field in {
            "src",
            "image",
            "cover_image",
        }
        if (
            is_link
            and value
            and not str(value).startswith(("https://", "http://", "mailto:", "#", "/"))
        ):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Unsafe link in {field}",
            )

    def _required_public_payload(self) -> dict[str, object]:
        publication = self.current_publication()
        if publication is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No portfolio published"
            )
        return publication.payload
