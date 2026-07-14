from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

import app.api.portfolio as portfolio_api
import app.integrations.redis as redis_integration
import app.portfolio.contact as contact_module
from app.core.config import get_settings
from app.db.session import engine
from app.main import app
from app.portfolio.models import (
    ContactSubmission,
    PortfolioPublication,
    PortfolioSite,
    PortfolioState,
)
from app.portfolio.seed import seed_portfolio_draft


@pytest.fixture()
def client() -> TestClient:
    """Run the application lifespan for each CMS integration test."""
    redis_integration.reset_fallback_rate_limits()
    with TestClient(app) as test_client:
        yield test_client
    redis_integration.reset_fallback_rate_limits()


def csrf(client: TestClient) -> str:
    return client.cookies.get("csrf_token", "")


def login_admin(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    assert response.status_code == 200


def mutation_headers(client: TestClient) -> dict[str, str]:
    return {"x-csrf-token": csrf(client)}


def png_bytes(width: int = 2, height: int = 3) -> bytes:
    return (
        b"\x89PNG\r\n\x1a\n"
        + b"\x00\x00\x00\rIHDR"
        + width.to_bytes(4, "big")
        + height.to_bytes(4, "big")
    )


def test_portfolio_seed_is_idempotent() -> None:
    with Session(engine) as session:
        assert seed_portfolio_draft(session) is False
        sites = list(session.exec(select(PortfolioSite)).all())
        assert len(sites) == 1


def test_normal_user_cannot_read_portfolio_admin(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "ChangeMe123!"},
    )
    assert client.get("/api/v1/admin/portfolio/site").status_code == 403


def test_admin_cms_mutations_require_csrf(client: TestClient) -> None:
    login_admin(client)
    response = client.patch(
        "/api/v1/admin/portfolio/site",
        json={"role": "Blocked update"},
    )
    assert response.status_code == 403


def test_draft_preview_publish_isolation_and_restore(client: TestClient) -> None:
    login_admin(client)
    with Session(engine) as session:
        state = session.get(PortfolioState, "default")
        assert state is not None
        state.current_publication_id = None
        session.add(state)
        session.commit()

    assert client.get("/api/v1/portfolio").json()["source"] == "none"

    first_role = f"Published role {uuid4().hex[:8]}"
    updated = client.patch(
        "/api/v1/admin/portfolio/site",
        headers=mutation_headers(client),
        json={"role": first_role},
    )
    assert updated.status_code == 200

    preview = client.get("/api/v1/admin/portfolio/preview")
    assert preview.status_code == 200
    assert preview.json()["content"]["profile"]["role"] == first_role

    first = client.post(
        "/api/v1/admin/portfolio/publish",
        headers=mutation_headers(client),
    )
    assert first.status_code == 200
    first_id = first.json()["id"]
    assert client.get("/api/v1/portfolio").json()["content"]["profile"]["role"] == first_role

    draft_role = f"Draft role {uuid4().hex[:8]}"
    assert (
        client.patch(
            "/api/v1/admin/portfolio/site",
            headers=mutation_headers(client),
            json={"role": draft_role},
        ).status_code
        == 200
    )
    assert client.get("/api/v1/portfolio").json()["content"]["profile"]["role"] == first_role
    preview = client.get("/api/v1/admin/portfolio/preview").json()
    assert preview["content"]["profile"]["role"] == draft_role

    second = client.post(
        "/api/v1/admin/portfolio/publish",
        headers=mutation_headers(client),
    )
    assert second.status_code == 200
    restored = client.post(
        f"/api/v1/admin/portfolio/publications/{first_id}/restore",
        headers=mutation_headers(client),
    )
    assert restored.status_code == 200
    assert restored.json()["restored_from_id"] == first_id
    assert restored.json()["version"] > second.json()["version"]
    assert client.get("/api/v1/portfolio").json()["content"]["profile"]["role"] == first_role


def test_cms_crud_ordering_and_optimistic_conflict(client: TestClient) -> None:
    login_admin(client)
    created = client.post(
        "/api/v1/admin/portfolio/services",
        headers=mutation_headers(client),
        json={
            "title": f"Service {uuid4().hex[:8]}",
            "summary": "A focused service created by the CMS test.",
            "icon_key": "code",
        },
    )
    assert created.status_code == 200
    record = created.json()

    conflict = client.patch(
        f"/api/v1/admin/portfolio/services/{record['id']}",
        headers=mutation_headers(client),
        json={
            "summary": "This stale update must not win.",
            "expected_updated_at": "2000-01-01T00:00:00Z",
        },
    )
    assert conflict.status_code == 409

    services = client.get("/api/v1/admin/portfolio/services").json()
    reversed_ids = [item["id"] for item in reversed(services)]
    reordered = client.put(
        "/api/v1/admin/portfolio/services/order",
        headers=mutation_headers(client),
        json={"ids": reversed_ids},
    )
    assert reordered.status_code == 200
    assert [item["id"] for item in reordered.json()] == reversed_ids

    archived = client.delete(
        f"/api/v1/admin/portfolio/services/{record['id']}",
        headers=mutation_headers(client),
    )
    assert archived.status_code == 200
    assert archived.json()["is_archived"] is True


def test_database_media_upload_etag_range_and_reference_protection(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    login_admin(client)
    monkeypatch.setattr("app.portfolio.media.MediaService._attempt_local_copy", lambda *_: None)

    uploaded = client.post(
        "/api/v1/admin/portfolio/media",
        headers=mutation_headers(client),
        files={"file": ("portrait.png", png_bytes(), "image/png")},
        data={"alt_text": "Tiny test portrait"},
    )
    assert uploaded.status_code == 201
    media = uploaded.json()
    assert media["width"] == 2
    assert media["height"] == 3
    assert media["local_path"] is None

    response = client.get(media["url"])
    assert response.status_code == 200
    assert response.content == png_bytes()
    assert response.headers["etag"]
    cached = client.get(media["url"], headers={"if-none-match": response.headers["etag"]})
    assert cached.status_code == 304

    partial = client.get(media["url"], headers={"range": "bytes=0-7"})
    assert partial.status_code == 206
    assert partial.content == png_bytes()[:8]
    assert partial.headers["content-range"].startswith("bytes 0-7/")

    site = client.get("/api/v1/admin/portfolio/site").json()
    original_media_id = site["hero_portrait_media_id"]
    assert (
        client.patch(
            "/api/v1/admin/portfolio/site",
            headers=mutation_headers(client),
            json={"hero_portrait_media_id": media["id"]},
        ).status_code
        == 200
    )
    protected = client.delete(
        f"/api/v1/admin/portfolio/media/{media['id']}?purge=true",
        headers=mutation_headers(client),
    )
    assert protected.status_code == 409
    assert (
        client.patch(
            "/api/v1/admin/portfolio/site",
            headers=mutation_headers(client),
            json={"hero_portrait_media_id": original_media_id},
        ).status_code
        == 200
    )


def test_media_rejects_mime_spoofing(client: TestClient) -> None:
    login_admin(client)
    response = client.post(
        "/api/v1/admin/portfolio/media",
        headers=mutation_headers(client),
        files={"file": ("fake.jpg", png_bytes(), "image/jpeg")},
        data={"alt_text": "Spoofed image"},
    )
    assert response.status_code == 415


def test_media_metadata_archive_and_upload_limit(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    login_admin(client)
    uploaded = client.post(
        "/api/v1/admin/portfolio/media",
        headers=mutation_headers(client),
        files={"file": ("editable.png", png_bytes(), "image/png")},
        data={"alt_text": "Original description"},
    )
    assert uploaded.status_code == 201
    media = uploaded.json()

    updated = client.patch(
        f"/api/v1/admin/portfolio/media/{media['id']}",
        headers=mutation_headers(client),
        json={
            "filename": "renamed.png",
            "alt_text": "Updated description",
            "expected_updated_at": media["updated_at"],
        },
    )
    assert updated.status_code == 200
    assert updated.json()["filename"] == "renamed.png"
    assert updated.json()["alt_text"] == "Updated description"

    archived = client.delete(
        f"/api/v1/admin/portfolio/media/{media['id']}",
        headers=mutation_headers(client),
    )
    assert archived.status_code == 200
    assert all(
        item["id"] != media["id"] for item in client.get("/api/v1/admin/portfolio/media").json()
    )
    assert client.get(media["url"]).status_code == 200

    monkeypatch.setattr(get_settings(), "media_max_bytes", 12)
    oversized = client.post(
        "/api/v1/admin/portfolio/media",
        headers=mutation_headers(client),
        files={"file": ("large.png", png_bytes(), "image/png")},
        data={"alt_text": "Too large"},
    )
    assert oversized.status_code == 413


def test_contact_is_stored_and_owner_delivery_can_succeed(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(contact_module, "send_email", lambda *_args, **_kwargs: True)
    response = client.post(
        "/api/v1/portfolio/contact",
        json={
            "name": "Portfolio Visitor",
            "email": "visitor@example.com",
            "subject": "A project enquiry",
            "message": "I would like to discuss a useful business application.",
            "website": "",
        },
    )
    assert response.status_code == 202
    with Session(engine) as session:
        submission = session.exec(
            select(ContactSubmission).where(ContactSubmission.email == "visitor@example.com")
        ).first()
        assert submission is not None
        assert submission.delivery_state == "sent"
        assert submission.delivery_attempts == 1


def test_contact_honeypot_and_rate_limit_reject_bots(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    payload = {
        "name": "Portfolio Visitor",
        "email": "bot@example.com",
        "subject": "A project enquiry",
        "message": "This message is long enough to pass normal validation.",
        "website": "filled by a bot",
    }
    assert client.post("/api/v1/portfolio/contact", json=payload).status_code == 422

    async def blocked(*_args: object, **_kwargs: object) -> bool:
        return False

    monkeypatch.setattr(portfolio_api, "allow_rate_limited_action", blocked)
    payload["website"] = ""
    assert client.post("/api/v1/portfolio/contact", json=payload).status_code == 429


def test_contact_accepts_short_nonblank_content(client: TestClient) -> None:
    response = client.post(
        "/api/v1/portfolio/contact",
        json={
            "name": "Q",
            "email": f"short-{uuid4()}@example.com",
            "subject": "Hi",
            "message": "Call",
            "website": "",
        },
    )
    assert response.status_code == 202


@pytest.mark.parametrize("field", ["name", "subject", "message"])
def test_contact_rejects_blank_text(client: TestClient, field: str) -> None:
    payload = {
        "name": "Visitor",
        "email": f"blank-{uuid4()}@example.com",
        "subject": "Project",
        "message": "Hello",
        "website": "",
    }
    payload[field] = "   "
    response = client.post("/api/v1/portfolio/contact", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == field


def test_contact_is_stored_when_smtp_is_not_configured(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    email = f"failed-{uuid4()}@example.com"
    monkeypatch.setattr(contact_module, "send_email", lambda *_args, **_kwargs: False)

    response = client.post(
        "/api/v1/portfolio/contact",
        json={
            "name": "Stored Visitor",
            "email": email,
            "subject": "Stored before delivery",
            "message": "Please keep this enquiry even without SMTP.",
            "website": "",
        },
    )
    assert response.status_code == 202
    assert response.json() == {"status": "accepted"}

    with Session(engine) as session:
        submission = session.exec(
            select(ContactSubmission).where(ContactSubmission.email == email)
        ).one()
        assert submission.delivery_state == "failed"
        assert submission.delivery_attempts == 1
        assert submission.delivery_error == "RuntimeError: SMTP is not configured"

    login_admin(client)
    inbox = client.get("/api/v1/admin/portfolio/contacts").json()
    stored = next(item for item in inbox if item["email"] == email)
    assert stored["delivery_state"] == "failed"
    assert stored["delivery_error"] == "RuntimeError: SMTP is not configured"


def test_contact_delivery_error_redacts_smtp_credentials(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = get_settings()
    monkeypatch.setattr(settings, "smtp_user", "private-user")
    monkeypatch.setattr(settings, "smtp_password", "private-password")

    def fail_delivery(*_args: object, **_kwargs: object) -> bool:
        raise RuntimeError("Login private-user failed with private-password")

    monkeypatch.setattr(contact_module, "send_email", fail_delivery)
    email = f"redacted-{uuid4()}@example.com"
    response = client.post(
        "/api/v1/portfolio/contact",
        json={
            "name": "Credential Check",
            "email": email,
            "subject": "Redact credentials",
            "message": "Do not expose configured credentials.",
            "website": "",
        },
    )
    assert response.status_code == 202
    with Session(engine) as session:
        submission = session.exec(
            select(ContactSubmission).where(ContactSubmission.email == email)
        ).one()
        assert submission.delivery_error is not None
        assert "private-user" not in submission.delivery_error
        assert "private-password" not in submission.delivery_error
        assert submission.delivery_error.count("[redacted]") == 2


def test_published_detail_endpoints_use_snapshot_content(client: TestClient) -> None:
    login_admin(client)
    published = client.post(
        "/api/v1/admin/portfolio/publish",
        headers=mutation_headers(client),
    )
    assert published.status_code == 200

    posts = client.get("/api/v1/portfolio/posts")
    assert posts.status_code == 200
    first_post = posts.json()[0]
    detail = client.get(f"/api/v1/portfolio/posts/{first_post['slug']}")
    assert detail.status_code == 200
    assert detail.json()["body_markdown"].startswith("# ")

    project = client.get("/api/v1/portfolio/projects/commerce-platform")
    assert project.status_code == 200
    assert project.json()["case_study_markdown"].startswith("# Commerce Platform")


def test_publication_history_is_immutable() -> None:
    with Session(engine) as session:
        publication = session.exec(
            select(PortfolioPublication).order_by(PortfolioPublication.version.desc())
        ).first()
        assert publication is not None
        assert publication.checksum
        assert isinstance(publication.payload, dict)


def test_publish_revalidates_links_at_snapshot_boundary(client: TestClient) -> None:
    with Session(engine) as session:
        site = session.get(PortfolioSite, "default")
        assert site is not None
        original_url = site.consultation_url
        site.consultation_url = "javascript:alert(1)"
        session.add(site)
        session.commit()

    try:
        login_admin(client)
        response = client.post(
            "/api/v1/admin/portfolio/publish",
            headers=mutation_headers(client),
        )
        assert response.status_code == 422
    finally:
        with Session(engine) as session:
            site = session.get(PortfolioSite, "default")
            assert site is not None
            site.consultation_url = original_url
            session.add(site)
            session.commit()


def test_contact_retry_endpoint_preserves_delivery_state(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    with Session(engine) as session:
        submission = ContactSubmission(
            name="Retry Visitor",
            email=f"retry-{uuid4()}@example.com",
            subject="Retry this delivery",
            message="This stored message should be retried from the admin inbox.",
            delivery_state="failed",
        )
        session.add(submission)
        session.commit()
        session.refresh(submission)
        submission_id = UUID(str(submission.id))

    monkeypatch.setattr(contact_module, "send_email", lambda *_args, **_kwargs: True)
    login_admin(client)
    retried = client.post(
        f"/api/v1/admin/portfolio/contacts/{submission_id}/retry-email",
        headers=mutation_headers(client),
    )
    assert retried.status_code == 200
    assert retried.json()["delivery_state"] == "sent"
    assert retried.json()["delivery_attempts"] == 1


def test_contact_inbox_update_accepts_api_timestamp(client: TestClient) -> None:
    response = client.post(
        "/api/v1/portfolio/contact",
        json={
            "name": "Inbox Visitor",
            "email": f"inbox-{uuid4()}@example.com",
            "subject": "Review this enquiry",
            "message": "This enquiry should move to the read inbox state.",
            "website": "",
        },
    )
    assert response.status_code == 202

    login_admin(client)
    contact = client.get("/api/v1/admin/portfolio/contacts").json()[0]
    updated = client.patch(
        f"/api/v1/admin/portfolio/contacts/{contact['id']}",
        headers=mutation_headers(client),
        json={"inbox_state": "read", "expected_updated_at": contact["updated_at"]},
    )
    assert updated.status_code == 200
    assert updated.json()["inbox_state"] == "read"
