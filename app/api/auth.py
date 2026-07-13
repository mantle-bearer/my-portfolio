"""Authentication and account management endpoints."""

from datetime import UTC, datetime

import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlmodel import Session, delete, select

from app.auth.cookies import clear_auth_cookies, set_auth_cookies
from app.auth.dependencies import (
    get_current_user,
    get_optional_current_user,
    get_user_by_email,
    verify_csrf,
)
from app.auth.password_reset import send_password_reset_email
from app.auth.security import (
    decode_password_reset_token,
    decode_token,
    hash_password,
    parse_user_id,
    verify_password,
)
from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.integrations.redis import allow_login_attempt
from app.models import Item, Role, User
from app.schemas import (
    LoginRequest,
    Message,
    PasswordChange,
    PasswordRecoveryRequest,
    PasswordResetRequest,
    ProfileUpdate,
    UserCreate,
    UserRead,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserRead)
async def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> User:
    """Authenticate a user and issue cookie-backed session tokens."""
    key = f"login:{request.client.host if request.client else 'unknown'}:{body.email.lower()}"
    if not await allow_login_attempt(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts",
        )
    user = get_user_by_email(session, body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    set_auth_cookies(response, user, settings)
    return user


@router.post("/signup", response_model=UserRead)
def signup(
    body: UserCreate,
    response: Response,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> User:
    """Create a user account when signup is enabled."""
    if settings.is_production and not settings.enable_signup:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Signup disabled")
    if get_user_by_email(session, body.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    role = session.exec(select(Role).where(Role.name == "user")).one()
    user = User(
        email=body.email.lower(),
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        roles=[role],
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    set_auth_cookies(response, user, settings)
    return user


@router.post("/refresh", response_model=UserRead)
def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias="refresh_token"),
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> User:
    """Rotate the access and refresh cookies from a valid refresh token."""
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_token(refresh_token, settings)
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    user = session.get(User, parse_user_id(payload["sub"]))
    if not user or user.token_version != payload.get("token_version"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
    set_auth_cookies(response, user, settings)
    return user


@router.post("/logout", dependencies=[Depends(verify_csrf)])
def logout(
    response: Response,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    """Revoke the current session and clear auth cookies."""
    user.token_version += 1
    user.updated_at = datetime.now(UTC)
    session.add(user)
    session.commit()
    clear_auth_cookies(response, settings)
    return {"status": "logged_out"}


@router.get("/me", response_model=UserRead | None)
def me(user: User | None = Depends(get_optional_current_user)) -> User | None:
    """Return the current user, or null when no active session exists."""
    return user


@router.patch("/me", response_model=UserRead, dependencies=[Depends(verify_csrf)])
def update_me(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> User:
    """Update the current user's profile and email address."""
    if body.email and body.email.lower() != user.email:
        existing = get_user_by_email(session, body.email)
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        user.email = body.email.lower()
    if body.full_name is not None:
        user.full_name = body.full_name
    user.updated_at = datetime.now(UTC)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/me/password", dependencies=[Depends(verify_csrf)])
def change_password(
    body: PasswordChange,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> dict[str, str]:
    """Change the current user's password and revoke active sessions."""
    if not verify_password(body.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wrong password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different",
        )
    user.hashed_password = hash_password(body.new_password)
    user.token_version += 1
    session.add(user)
    session.commit()
    return {"status": "password_changed"}


@router.delete("/me", response_model=Message, dependencies=[Depends(verify_csrf)])
def delete_me(
    response: Response,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> Message:
    """Delete the current non-admin account and owned items."""
    if any(role.name == "admin" for role in user.roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin users cannot delete themselves",
        )
    if user.email == "user@example.com" or user.email == "admin@example.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete the example users",
        )
    session.exec(delete(Item).where(Item.owner_id == user.id))
    session.delete(user)
    session.commit()
    clear_auth_cookies(response, settings)
    return Message(message="Account deleted")


@router.post("/password-recovery", response_model=Message)
def recover_password(
    body: PasswordRecoveryRequest,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> Message:
    """Send a password recovery email without revealing account existence."""
    user = get_user_by_email(session, body.email)
    if user:
        send_password_reset_email(user, settings)
    return Message(message="If that email is registered, we sent a password recovery link")


@router.post("/reset-password", response_model=Message)
def reset_password(
    body: PasswordResetRequest,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> Message:
    """Reset a user's password from a valid recovery token."""
    try:
        email = decode_password_reset_token(body.token, settings)
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token",
        ) from exc
    user = get_user_by_email(session, email)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    user.hashed_password = hash_password(body.new_password)
    user.token_version += 1
    user.updated_at = datetime.now(UTC)
    session.add(user)
    session.commit()
    return Message(message="Password updated")
