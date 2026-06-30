"""Cookie helpers for the application-owned auth session."""

from fastapi import Response

from app.auth.security import create_token, new_csrf_token
from app.core.config import Settings
from app.models import User


def set_auth_cookies(response: Response, user: User, settings: Settings) -> None:
    """Attach access, refresh, and CSRF cookies for a signed-in user."""
    csrf = new_csrf_token()
    cookie_args = {
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": "lax",
        "domain": settings.cookie_domain,
    }
    response.set_cookie(
        settings.access_cookie_name,
        create_token(user, settings, "access"),
        max_age=settings.access_token_minutes * 60,
        **cookie_args,
    )
    response.set_cookie(
        settings.refresh_cookie_name,
        create_token(user, settings, "refresh"),
        max_age=settings.refresh_token_days * 86400,
        **cookie_args,
    )
    response.set_cookie(
        settings.csrf_cookie_name,
        csrf,
        max_age=settings.refresh_token_days * 86400,
        httponly=False,
        secure=settings.cookie_secure,
        samesite="lax",
        domain=settings.cookie_domain,
    )


def clear_auth_cookies(response: Response, settings: Settings) -> None:
    """Remove all auth cookies from a response."""
    for name in [
        settings.access_cookie_name,
        settings.refresh_cookie_name,
        settings.csrf_cookie_name,
    ]:
        response.delete_cookie(name, domain=settings.cookie_domain)
