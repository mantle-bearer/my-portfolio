"""Password hashing, JWT, CSRF, and identifier helpers."""

from datetime import UTC, datetime, timedelta
from secrets import token_urlsafe
from typing import Any
from uuid import UUID

import jwt
from pwdlib import PasswordHash

from app.core.config import Settings
from app.models import User

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored hash."""
    return password_hash.verify(password, hashed_password)


def create_token(user: User, settings: Settings, token_type: str) -> str:
    """Create a signed access or refresh JWT for a user."""
    if token_type == "access":
        expires_delta = timedelta(minutes=settings.access_token_minutes)
    else:
        expires_delta = timedelta(days=settings.refresh_token_days)
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": str(user.id),
        "email": user.email,
        "type": token_type,
        "token_version": user.token_version,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_password_reset_token(email: str, settings: Settings) -> str:
    """Create a short-lived password reset JWT for an email address."""
    now = datetime.now(UTC)
    expires_delta = timedelta(minutes=settings.password_reset_token_minutes)
    payload: dict[str, Any] = {
        "sub": email.lower(),
        "type": "password_reset",
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_password_reset_token(token: str, settings: Settings) -> str:
    """Decode a password reset token and return its email subject."""
    payload = decode_token(token, settings)
    if payload.get("type") != "password_reset":
        raise jwt.InvalidTokenError("Invalid token type")
    return str(payload["sub"])


def decode_token(token: str, settings: Settings) -> dict[str, Any]:
    """Decode a JWT using application settings."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def new_csrf_token() -> str:
    """Create a random CSRF token."""
    return token_urlsafe(32)


def parse_user_id(value: str) -> UUID:
    """Parse a user ID from a token subject."""
    return UUID(value)
