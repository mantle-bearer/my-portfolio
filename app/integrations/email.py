"""Optional SMTP email integration."""

import logging
import smtplib
from email.message import EmailMessage

from app.core.config import Settings

logger = logging.getLogger(__name__)


def email_enabled(settings: Settings) -> bool:
    """Return whether enough SMTP settings exist to send email."""
    return bool(settings.smtp_host and settings.emails_from_email)


def send_email(settings: Settings, email_to: str, subject: str, body: str) -> bool:
    """Send a plaintext email when SMTP is configured."""
    if not email_enabled(settings):
        logger.info("Email disabled; would send %s to %s", subject, email_to)
        return False

    message = EmailMessage()
    message["From"] = settings.emails_from_email or ""
    message["To"] = email_to
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(settings.smtp_host or "", settings.smtp_port) as smtp:
        if settings.smtp_tls:
            smtp.starttls()
        if settings.smtp_user and settings.smtp_password:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(message)
    return True
