"""Authenticated administration endpoints for the portfolio CMS."""

from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlmodel import Session, select

from app.auth.dependencies import require_permission, verify_csrf
from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.models import User
from app.portfolio.contact import ContactService, deliver_contact_notification
from app.portfolio.content import PortfolioContentService
from app.portfolio.media import MediaService
from app.portfolio.models import (
    AboutCard,
    HeroExpertise,
    PortfolioPost,
    PortfolioProject,
    PortfolioSectionSetting,
    PortfolioService,
    PostCategory,
    SocialLink,
    TechnologyStack,
)
from app.portfolio.publishing import PortfolioPublishingService
from app.portfolio.schemas import (
    AboutCardCreate,
    AboutCardRead,
    AboutCardUpdate,
    CollectionOrderUpdate,
    ContactSubmissionRead,
    ContactSubmissionUpdate,
    HeroExpertiseCreate,
    HeroExpertiseRead,
    HeroExpertiseUpdate,
    MediaAssetRead,
    MediaAssetUpdate,
    Message,
    PortfolioContentResponse,
    PortfolioPostCreate,
    PortfolioPostRead,
    PortfolioPostUpdate,
    PortfolioProjectCreate,
    PortfolioProjectRead,
    PortfolioProjectUpdate,
    PortfolioPublicationRead,
    PortfolioServiceCreate,
    PortfolioServiceRead,
    PortfolioServiceUpdate,
    PortfolioSiteRead,
    PortfolioSiteUpdate,
    PostCategoryCreate,
    PostCategoryRead,
    PostCategoryUpdate,
    SectionSettingRead,
    SectionSettingUpdate,
    SocialLinkCreate,
    SocialLinkRead,
    SocialLinkUpdate,
    TechnologyStackCreate,
    TechnologyStackRead,
    TechnologyStackUpdate,
)

router = APIRouter(prefix="/admin/portfolio", tags=["portfolio-admin"])

read_access = Depends(require_permission("portfolio:read"))
write_access = Depends(require_permission("portfolio:write"))
publish_access = Depends(require_permission("portfolio:publish"))
media_access = Depends(require_permission("media:write"))
contacts_read_access = Depends(require_permission("contacts:read"))
contacts_write_access = Depends(require_permission("contacts:write"))
csrf_access = Depends(verify_csrf)


def _content(session: Session) -> PortfolioContentService:
    return PortfolioContentService(session)


def _publishing(session: Session, settings: Settings) -> PortfolioPublishingService:
    return PortfolioPublishingService(session, MediaService(session, settings))


@router.get("/site", response_model=PortfolioSiteRead)
def read_site(
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read the singleton draft site."""
    return _content(session).get_site()


@router.patch(
    "/site",
    response_model=PortfolioSiteRead,
    dependencies=[csrf_access],
)
def update_site(
    body: PortfolioSiteUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update global draft content."""
    return _content(session).update_site(body)


@router.get("/sections", response_model=list[SectionSettingRead])
def list_sections(
    session: Session = Depends(get_session),
    _: User = read_access,
) -> list[object]:
    """List fixed portfolio section settings."""
    return list(session.exec(select(PortfolioSectionSetting)).all())


@router.get("/sections/{key}", response_model=SectionSettingRead)
def read_section(
    key: str,
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read one fixed section setting."""
    return _content(session).get_section(key)


@router.patch(
    "/sections/{key}",
    response_model=SectionSettingRead,
    dependencies=[csrf_access],
)
def update_section(
    key: str,
    body: SectionSettingUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update one fixed section setting."""
    return _content(session).update_section(key, body)


@router.get("/expertise", response_model=list[HeroExpertiseRead])
def list_expertise(session: Session = Depends(get_session), _: User = read_access) -> list[object]:
    """List hero expertise records."""
    return _content(session).list_records(HeroExpertise)


@router.post(
    "/expertise",
    response_model=HeroExpertiseRead,
    dependencies=[csrf_access],
)
def create_expertise(
    body: HeroExpertiseCreate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Create hero expertise."""
    return _content(session).create_record(HeroExpertise, body)


@router.put(
    "/expertise/order",
    response_model=list[HeroExpertiseRead],
    dependencies=[csrf_access],
)
def order_expertise(
    body: CollectionOrderUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> list[object]:
    """Replace hero expertise order."""
    return _content(session).reorder(HeroExpertise, body.ids)


@router.get("/expertise/{record_id}", response_model=HeroExpertiseRead)
def read_expertise(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read hero expertise."""
    return _content(session).get_record(HeroExpertise, record_id)


@router.patch(
    "/expertise/{record_id}",
    response_model=HeroExpertiseRead,
    dependencies=[csrf_access],
)
def update_expertise(
    record_id: UUID,
    body: HeroExpertiseUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update hero expertise."""
    return _content(session).update_record(HeroExpertise, record_id, body)


@router.delete(
    "/expertise/{record_id}",
    response_model=HeroExpertiseRead,
    dependencies=[csrf_access],
)
def archive_expertise(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Archive hero expertise."""
    return _content(session).archive_record(HeroExpertise, record_id)


@router.get("/social-links", response_model=list[SocialLinkRead])
def list_social_links(
    session: Session = Depends(get_session), _: User = read_access
) -> list[object]:
    """List social links."""
    return _content(session).list_records(SocialLink)


@router.post(
    "/social-links",
    response_model=SocialLinkRead,
    dependencies=[csrf_access],
)
def create_social_link(
    body: SocialLinkCreate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Create a social link."""
    return _content(session).create_record(SocialLink, body)


@router.put(
    "/social-links/order",
    response_model=list[SocialLinkRead],
    dependencies=[csrf_access],
)
def order_social_links(
    body: CollectionOrderUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> list[object]:
    """Replace social-link order."""
    return _content(session).reorder(SocialLink, body.ids)


@router.get("/social-links/{record_id}", response_model=SocialLinkRead)
def read_social_link(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read a social link."""
    return _content(session).get_record(SocialLink, record_id)


@router.patch(
    "/social-links/{record_id}",
    response_model=SocialLinkRead,
    dependencies=[csrf_access],
)
def update_social_link(
    record_id: UUID,
    body: SocialLinkUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update a social link."""
    return _content(session).update_record(SocialLink, record_id, body)


@router.delete(
    "/social-links/{record_id}",
    response_model=SocialLinkRead,
    dependencies=[csrf_access],
)
def archive_social_link(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Archive a social link."""
    return _content(session).archive_record(SocialLink, record_id)


@router.get("/about-cards", response_model=list[AboutCardRead])
def list_about_cards(
    session: Session = Depends(get_session), _: User = read_access
) -> list[object]:
    """List About bento cards."""
    return _content(session).list_records(AboutCard)


@router.post(
    "/about-cards",
    response_model=AboutCardRead,
    dependencies=[csrf_access],
)
def create_about_card(
    body: AboutCardCreate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Create an About card."""
    return _content(session).create_record(AboutCard, body)


@router.put(
    "/about-cards/order",
    response_model=list[AboutCardRead],
    dependencies=[csrf_access],
)
def order_about_cards(
    body: CollectionOrderUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> list[object]:
    """Replace About card order."""
    return _content(session).reorder(AboutCard, body.ids)


@router.get("/about-cards/{record_id}", response_model=AboutCardRead)
def read_about_card(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read an About card."""
    return _content(session).get_record(AboutCard, record_id)


@router.patch(
    "/about-cards/{record_id}",
    response_model=AboutCardRead,
    dependencies=[csrf_access],
)
def update_about_card(
    record_id: UUID,
    body: AboutCardUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update an About card."""
    return _content(session).update_record(AboutCard, record_id, body)


@router.delete(
    "/about-cards/{record_id}",
    response_model=AboutCardRead,
    dependencies=[csrf_access],
)
def archive_about_card(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Archive an About card."""
    return _content(session).archive_record(AboutCard, record_id)


@router.get("/stacks", response_model=list[TechnologyStackRead])
def list_stacks(session: Session = Depends(get_session), _: User = read_access) -> list[object]:
    """List technology stacks."""
    return _content(session).list_records(TechnologyStack)


@router.post("/stacks", response_model=TechnologyStackRead, dependencies=[csrf_access])
def create_stack(
    body: TechnologyStackCreate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Create a technology stack."""
    return _content(session).create_record(TechnologyStack, body)


@router.put(
    "/stacks/order",
    response_model=list[TechnologyStackRead],
    dependencies=[csrf_access],
)
def order_stacks(
    body: CollectionOrderUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> list[object]:
    """Replace technology-stack order."""
    return _content(session).reorder(TechnologyStack, body.ids)


@router.get("/stacks/{record_id}", response_model=TechnologyStackRead)
def read_stack(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read a technology stack."""
    return _content(session).get_record(TechnologyStack, record_id)


@router.patch("/stacks/{record_id}", response_model=TechnologyStackRead, dependencies=[csrf_access])
def update_stack(
    record_id: UUID,
    body: TechnologyStackUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update a technology stack."""
    return _content(session).update_record(TechnologyStack, record_id, body)


@router.delete(
    "/stacks/{record_id}", response_model=TechnologyStackRead, dependencies=[csrf_access]
)
def archive_stack(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Archive a technology stack."""
    return _content(session).archive_record(TechnologyStack, record_id)


@router.get("/services", response_model=list[PortfolioServiceRead])
def list_services(session: Session = Depends(get_session), _: User = read_access) -> list[object]:
    """List portfolio services."""
    return _content(session).list_records(PortfolioService)


@router.post("/services", response_model=PortfolioServiceRead, dependencies=[csrf_access])
def create_service(
    body: PortfolioServiceCreate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Create a portfolio service."""
    return _content(session).create_record(PortfolioService, body)


@router.put(
    "/services/order",
    response_model=list[PortfolioServiceRead],
    dependencies=[csrf_access],
)
def order_services(
    body: CollectionOrderUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> list[object]:
    """Replace portfolio-service order."""
    return _content(session).reorder(PortfolioService, body.ids)


@router.get("/services/{record_id}", response_model=PortfolioServiceRead)
def read_service(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read a portfolio service."""
    return _content(session).get_record(PortfolioService, record_id)


@router.patch(
    "/services/{record_id}", response_model=PortfolioServiceRead, dependencies=[csrf_access]
)
def update_service(
    record_id: UUID,
    body: PortfolioServiceUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update a portfolio service."""
    return _content(session).update_record(PortfolioService, record_id, body)


@router.delete(
    "/services/{record_id}", response_model=PortfolioServiceRead, dependencies=[csrf_access]
)
def archive_service(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Archive a portfolio service."""
    return _content(session).archive_record(PortfolioService, record_id)


@router.get("/projects", response_model=list[PortfolioProjectRead])
def list_projects(session: Session = Depends(get_session), _: User = read_access) -> list[object]:
    """List portfolio projects."""
    return _content(session).list_records(PortfolioProject)


@router.post("/projects", response_model=PortfolioProjectRead, dependencies=[csrf_access])
def create_project(
    body: PortfolioProjectCreate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Create a portfolio project."""
    return _content(session).create_record(PortfolioProject, body)


@router.put(
    "/projects/order",
    response_model=list[PortfolioProjectRead],
    dependencies=[csrf_access],
)
def order_projects(
    body: CollectionOrderUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> list[object]:
    """Replace project order."""
    return _content(session).reorder(PortfolioProject, body.ids)


@router.get("/projects/{record_id}", response_model=PortfolioProjectRead)
def read_project(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read a portfolio project."""
    return _content(session).get_record(PortfolioProject, record_id)


@router.patch(
    "/projects/{record_id}", response_model=PortfolioProjectRead, dependencies=[csrf_access]
)
def update_project(
    record_id: UUID,
    body: PortfolioProjectUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update a portfolio project."""
    return _content(session).update_record(PortfolioProject, record_id, body)


@router.delete(
    "/projects/{record_id}", response_model=PortfolioProjectRead, dependencies=[csrf_access]
)
def archive_project(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Archive a portfolio project."""
    return _content(session).archive_record(PortfolioProject, record_id)


@router.get("/categories", response_model=list[PostCategoryRead])
def list_categories(session: Session = Depends(get_session), _: User = read_access) -> list[object]:
    """List post categories."""
    return _content(session).list_records(PostCategory)


@router.post("/categories", response_model=PostCategoryRead, dependencies=[csrf_access])
def create_category(
    body: PostCategoryCreate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Create a post category."""
    return _content(session).create_record(PostCategory, body)


@router.put(
    "/categories/order",
    response_model=list[PostCategoryRead],
    dependencies=[csrf_access],
)
def order_categories(
    body: CollectionOrderUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> list[object]:
    """Replace category order."""
    return _content(session).reorder(PostCategory, body.ids)


@router.get("/categories/{record_id}", response_model=PostCategoryRead)
def read_category(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read a post category."""
    return _content(session).get_record(PostCategory, record_id)


@router.patch(
    "/categories/{record_id}", response_model=PostCategoryRead, dependencies=[csrf_access]
)
def update_category(
    record_id: UUID,
    body: PostCategoryUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update a post category."""
    return _content(session).update_record(PostCategory, record_id, body)


@router.delete(
    "/categories/{record_id}", response_model=PostCategoryRead, dependencies=[csrf_access]
)
def archive_category(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Archive a post category."""
    return _content(session).archive_record(PostCategory, record_id)


@router.get("/posts", response_model=list[PortfolioPostRead])
def list_posts(session: Session = Depends(get_session), _: User = read_access) -> list[object]:
    """List draft posts."""
    return _content(session).list_records(PortfolioPost)


@router.post("/posts", response_model=PortfolioPostRead, dependencies=[csrf_access])
def create_post(
    body: PortfolioPostCreate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Create a Markdown post."""
    return _content(session).create_record(PortfolioPost, body)


@router.put(
    "/posts/order",
    response_model=list[PortfolioPostRead],
    dependencies=[csrf_access],
)
def order_posts(
    body: CollectionOrderUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> list[object]:
    """Replace post order."""
    return _content(session).reorder(PortfolioPost, body.ids)


@router.get("/posts/{record_id}", response_model=PortfolioPostRead)
def read_post(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = read_access,
) -> object:
    """Read a draft post."""
    return _content(session).get_record(PortfolioPost, record_id)


@router.patch("/posts/{record_id}", response_model=PortfolioPostRead, dependencies=[csrf_access])
def update_post(
    record_id: UUID,
    body: PortfolioPostUpdate,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Update a Markdown post."""
    return _content(session).update_record(PortfolioPost, record_id, body)


@router.delete("/posts/{record_id}", response_model=PortfolioPostRead, dependencies=[csrf_access])
def archive_post(
    record_id: UUID,
    session: Session = Depends(get_session),
    _: User = write_access,
) -> object:
    """Archive a Markdown post."""
    return _content(session).archive_record(PortfolioPost, record_id)


@router.get("/media", response_model=list[MediaAssetRead])
def list_media(
    include_archived: bool = False,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    _: User = read_access,
) -> list[MediaAssetRead]:
    """List media metadata."""
    service = MediaService(session, settings)
    return [
        MediaAssetRead.model_validate(item).model_copy(update={"url": service.public_url(item)})
        for item in service.list(include_archived)
    ]


@router.post(
    "/media",
    response_model=MediaAssetRead,
    dependencies=[csrf_access],
    status_code=status.HTTP_201_CREATED,
)
async def upload_media(
    file: UploadFile = File(...),
    alt_text: str = Form(default="", max_length=300),
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    user: User = media_access,
) -> MediaAssetRead:
    """Upload validated image bytes into canonical database storage."""
    service = MediaService(session, settings)
    media = await service.upload(file, alt_text, user.id)
    return MediaAssetRead.model_validate(media).model_copy(
        update={"url": service.public_url(media)}
    )


@router.patch("/media/{media_id}", response_model=MediaAssetRead, dependencies=[csrf_access])
def update_media(
    media_id: UUID,
    body: MediaAssetUpdate,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    _: User = media_access,
) -> MediaAssetRead:
    """Update media metadata."""
    service = MediaService(session, settings)
    media = service.update(media_id, body.model_dump(exclude_unset=True))
    return MediaAssetRead.model_validate(media).model_copy(
        update={"url": service.public_url(media)}
    )


@router.delete("/media/{media_id}", response_model=Message, dependencies=[csrf_access])
def delete_media(
    media_id: UUID,
    purge: bool = False,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    _: User = media_access,
) -> Message:
    """Archive media by default or safely purge an unreferenced asset."""
    service = MediaService(session, settings)
    if purge:
        service.purge(media_id)
        return Message(message="Media purged")
    service.archive(media_id)
    return Message(message="Media archived")


@router.get("/preview", response_model=PortfolioContentResponse)
def preview(
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    _: User = read_access,
) -> PortfolioContentResponse:
    """Compose a private full-page draft preview payload."""
    return _publishing(session, settings).preview()


@router.post(
    "/publish",
    response_model=PortfolioPublicationRead,
    dependencies=[csrf_access],
)
def publish(
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    user: User = publish_access,
) -> object:
    """Validate and atomically publish the draft workspace."""
    return _publishing(session, settings).publish(user)


@router.get("/publications", response_model=list[PortfolioPublicationRead])
def list_publications(
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    _: User = read_access,
) -> list[object]:
    """List immutable publication history."""
    return _publishing(session, settings).list_publications()


@router.post(
    "/publications/{publication_id}/restore",
    response_model=PortfolioPublicationRead,
    dependencies=[csrf_access],
)
def restore_publication(
    publication_id: UUID,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    user: User = publish_access,
) -> object:
    """Create a new public version from immutable history."""
    return _publishing(session, settings).restore(publication_id, user)


@router.get("/contacts", response_model=list[ContactSubmissionRead])
def list_contacts(
    include_archived: bool = False,
    session: Session = Depends(get_session),
    _: User = contacts_read_access,
) -> list[object]:
    """List stored contact enquiries."""
    return ContactService(session).list(include_archived)


@router.patch(
    "/contacts/{submission_id}",
    response_model=ContactSubmissionRead,
    dependencies=[csrf_access],
)
def update_contact(
    submission_id: UUID,
    body: ContactSubmissionUpdate,
    session: Session = Depends(get_session),
    _: User = contacts_write_access,
) -> object:
    """Update contact inbox state or archive status."""
    return ContactService(session).update(
        submission_id,
        body.model_dump(exclude_unset=True),
    )


@router.post(
    "/contacts/{submission_id}/retry-email",
    response_model=ContactSubmissionRead,
    dependencies=[csrf_access],
)
def retry_contact_email(
    submission_id: UUID,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    _: User = contacts_write_access,
) -> object:
    """Retry one owner notification and retain its delivery result."""
    submission = ContactService(session).queue_retry(submission_id)
    deliver_contact_notification(submission.id, settings)
    session.expire_all()
    return ContactService(session).get(submission_id)
