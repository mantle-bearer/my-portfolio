"""Health endpoints for API and dependency status checks."""

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import engine
from app.integrations.redis import redis_status

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health() -> dict[str, str]:
    """Return a minimal liveness response."""
    return {"status": "ok"}


@router.get("/status")
async def status() -> dict[str, object]:
    """Return app, database, and optional Redis status."""
    settings = get_settings()
    db_ok = True
    try:
        with engine.connect() as connection:
            connection.execute(text("select 1"))
    except Exception:
        db_ok = False

    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "git_sha": settings.git_sha,
        "database": "ok" if db_ok else "unavailable",
        "redis": await redis_status(),
    }
