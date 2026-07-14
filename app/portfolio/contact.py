"""Contact enquiry persistence and owner-notification workflow."""

from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.config import Settings
from app.db.session import engine
from app.integrations.email import send_email
from app.portfolio.models import ContactSubmission, PortfolioSite
from app.portfolio.schemas import ContactCreate


class ContactService:
    """Persist enquiries before any best-effort email delivery."""

    def __init__(self, session: Session):
        """Initialize the service with a request-scoped session."""
        self.session = session

    def create(self, body: ContactCreate) -> ContactSubmission:
        """Store one validated public enquiry in pending-delivery state."""
        submission = ContactSubmission(
            name=body.name,
            email=str(body.email).lower(),
            subject=body.subject,
            message=body.message,
        )
        self.session.add(submission)
        self.session.commit()
        self.session.refresh(submission)
        return submission

    def list(self, include_archived: bool = False) -> list[ContactSubmission]:
        """List contact inbox entries newest first."""
        statement = select(ContactSubmission)
        if not include_archived:
            statement = statement.where(ContactSubmission.is_archived.is_(False))
        return list(
            self.session.exec(statement.order_by(ContactSubmission.created_at.desc())).all()
        )

    def get(self, submission_id: UUID) -> ContactSubmission:
        """Return one contact submission."""
        submission = self.session.get(ContactSubmission, submission_id)
        if submission is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
        return submission

    def update(self, submission_id: UUID, values: dict[str, object]) -> ContactSubmission:
        """Update an inbox state with optimistic conflict protection."""
        submission = self.get(submission_id)
        expected = values.pop("expected_updated_at", None)
        if expected is not None and _as_utc(expected) != _as_utc(submission.updated_at):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Contact changed")
        for field, value in values.items():
            setattr(submission, field, value)
        if values.get("inbox_state") == "archived":
            submission.is_archived = True
        submission.updated_at = datetime.now(UTC)
        self.session.add(submission)
        self.session.commit()
        self.session.refresh(submission)
        return submission

    def queue_retry(self, submission_id: UUID) -> ContactSubmission:
        """Return a failed contact to pending state before a background retry."""
        submission = self.get(submission_id)
        submission.delivery_state = "pending"
        submission.delivery_error = None
        submission.updated_at = datetime.now(UTC)
        self.session.add(submission)
        self.session.commit()
        self.session.refresh(submission)
        return submission


def deliver_contact_notification(submission_id: UUID, settings: Settings) -> None:
    """Attempt owner notification in a fresh session after the request completes."""
    with Session(engine) as session:
        submission = session.get(ContactSubmission, submission_id)
        site = session.get(PortfolioSite, "default")
        if submission is None:
            return
        submission.delivery_attempts += 1
        submission.last_delivery_at = datetime.now(UTC)
        try:
            if site is None or not site.notification_email:
                raise RuntimeError("Notification recipient is not configured")
            sent = send_email(
                settings,
                site.notification_email,
                f"Portfolio enquiry: {submission.subject}",
                "\n".join(
                    (
                        f"Name: {submission.name}",
                        f"Email: {submission.email}",
                        f"Subject: {submission.subject}",
                        "",
                        submission.message,
                    )
                ),
            )
            if not sent:
                raise RuntimeError("SMTP is not configured")
        except Exception as exc:
            submission.delivery_state = "failed"
            submission.delivery_error = _safe_delivery_error(exc, settings)
        else:
            submission.delivery_state = "sent"
            submission.delivered_at = datetime.now(UTC)
            submission.delivery_error = None
        submission.updated_at = datetime.now(UTC)
        session.add(submission)
        session.commit()


def _safe_delivery_error(exc: Exception, settings: Settings) -> str:
    """Store a short operational error without SMTP credentials or traceback data."""
    message = " ".join(str(exc).split())
    for credential in (settings.smtp_password, settings.smtp_user):
        if credential:
            message = message.replace(credential, "[redacted]")
    message = message[:180]
    return f"{type(exc).__name__}: {message or 'delivery failed'}"


def _as_utc(value: datetime) -> datetime:
    """Normalize SQLite-naive and PostgreSQL-aware timestamps for conflicts."""
    return value.astimezone(UTC) if value.tzinfo else value.replace(tzinfo=UTC)
