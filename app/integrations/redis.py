"""Optional Redis helpers backed by the FastAPI Redis SDK."""

from functools import lru_cache
from typing import TYPE_CHECKING, Any

from app.core.config import get_settings

if TYPE_CHECKING:
    from redis.asyncio import Redis


def _build_sdk_redis_client(redis_url: str) -> Any:
    """Build an async Redis client with fastapi-redis-sdk configuration."""
    from redis.asyncio import Redis
    from redis_fastapi import get_settings as get_redis_settings
    from redis_fastapi.deps import _PoolState

    redis_settings = get_redis_settings()
    redis_settings.url = redis_url
    redis_settings.socket_connect_timeout = redis_settings.socket_connect_timeout or 2
    redis_settings.socket_timeout = redis_settings.socket_timeout or 2

    return Redis(connection_pool=_PoolState.build_async_pool())


@lru_cache
def get_redis() -> "Redis | None":
    """Build a Redis client lazily when a Redis URL is configured."""
    settings = get_settings()
    if not settings.redis_url:
        return None

    return _build_sdk_redis_client(settings.redis_url)


async def redis_status() -> str:
    """Return Redis availability without raising connection errors."""
    client = get_redis()
    if client is None:
        return "not_configured"
    try:
        await client.ping()
    except (OSError, TimeoutError):
        return "unavailable"
    except Exception:
        return "unavailable"
    return "ok"


async def allow_login_attempt(key: str, limit: int = 5, window_seconds: int = 60) -> bool:
    """Rate limit login attempts when Redis is reachable, otherwise allow them."""
    client = get_redis()
    if client is None:
        return True
    try:
        current = await client.incr(key)
        if current == 1:
            await client.expire(key, window_seconds)
    except (OSError, TimeoutError):
        return True
    except Exception:
        return True
    return bool(current <= limit)
