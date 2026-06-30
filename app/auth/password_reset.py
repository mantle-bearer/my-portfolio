"""Password reset helpers for optional SMTP recovery flows."""

from app.auth.security import create_password_reset_token
from app.core.config import Settings
from app.integrations.email import send_email
from app.models import User


def send_password_reset_email(user: User, settings: Settings) -> None:
    """Send a password reset email when SMTP is configured."""
    token = create_password_reset_token(user.email, settings)
    reset_url = f"{settings.public_base_url.rstrip('/')}/reset-password?token={token}"
    send_email(
        settings,
        user.email,
        "Reset your password",
        f"Use this link to reset your password: {reset_url}",
    )
