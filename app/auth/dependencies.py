"""Auth dependencies for sessions, CSRF, roles, and permissions."""

from collections.abc import Callable
from uuid import UUID

import jwt
from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.auth.security import decode_token
from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.models import User


def get_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> User:
    """Return the authenticated user from the access-token cookie."""
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_token(access_token, settings)
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    user = session.get(User, UUID(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    if user.token_version != payload.get("token_version"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    return user


def get_optional_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> User | None:
    """Return the current user when a valid session exists, otherwise ``None``."""
    if not access_token:
        return None
    try:
        payload = decode_token(access_token, settings)
        if payload.get("type") != "access":
            return None
        user = session.get(User, UUID(payload["sub"]))
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        return None
    if not user or not user.is_active or user.token_version != payload.get("token_version"):
        return None
    return user


def verify_csrf(
    request: Request,
    csrf_cookie: str | None = Cookie(default=None, alias="csrf_token"),
) -> None:
    """Validate the double-submit CSRF token for mutating requests."""
    if request.method in {"GET", "HEAD", "OPTIONS"}:
        return
    csrf_header = request.headers.get("x-csrf-token")
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid CSRF token")


def user_permissions(user: User) -> set[str]:
    """Return all permission codes granted to a user."""
    return {permission.code for role in user.roles for permission in role.permissions}


def require_permission(permission: str) -> Callable[[User], User]:
    """Create a dependency requiring a specific permission."""

    def dependency(user: User = Depends(get_current_user)) -> User:
        """Require the configured permission for the current user."""
        if permission not in user_permissions(user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        return user

    return dependency


def require_role(role_name: str) -> Callable[[User], User]:
    """Create a dependency requiring a specific role."""

    def dependency(user: User = Depends(get_current_user)) -> User:
        """Require the configured role for the current user."""
        if role_name not in {role.name for role in user.roles}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Role required")
        return user

    return dependency


def get_user_by_email(session: Session, email: str) -> User | None:
    """Find a user by normalized email address."""
    return session.exec(select(User).where(User.email == email.lower())).first()
