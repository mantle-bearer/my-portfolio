from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

import app.api.auth as auth_api
import app.api.health as health_api
import app.integrations.redis as redis_integration
from app.auth.security import create_password_reset_token
from app.core.config import Settings, get_settings
from app.main import app


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def csrf(client: TestClient) -> str:
    return client.cookies.get("csrf_token", "")


def test_health_status(client: TestClient) -> None:
    response = client.get("/api/v1/health/status")
    assert response.status_code == 200
    assert response.json()["database"] == "ok"
    assert response.json()["redis"] == "not_configured"


def test_health_status_reports_unavailable_redis(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def unavailable() -> str:
        return "unavailable"

    monkeypatch.setattr(health_api, "redis_status", unavailable)
    response = client.get("/api/v1/health/status")
    assert response.status_code == 200
    assert response.json()["redis"] == "unavailable"


def test_empty_redis_config_does_not_build_sdk_client(monkeypatch: pytest.MonkeyPatch) -> None:
    def fail_build(_redis_url: str) -> None:
        raise AssertionError("Redis SDK client should not be initialized")

    redis_integration.get_redis.cache_clear()
    monkeypatch.setattr(redis_integration, "_build_sdk_redis_client", fail_build)

    assert redis_integration.get_redis() is None


@pytest.mark.asyncio
async def test_login_rate_limit_blocks_after_threshold(monkeypatch: pytest.MonkeyPatch) -> None:
    class MemoryRedis:
        def __init__(self) -> None:
            self.counts: dict[str, int] = {}

        async def incr(self, key: str) -> int:
            self.counts[key] = self.counts.get(key, 0) + 1
            return self.counts[key]

        async def expire(self, _key: str, _seconds: int) -> None:
            return None

    memory_redis = MemoryRedis()
    monkeypatch.setattr(redis_integration, "get_redis", lambda: memory_redis)

    key = "login:test@example.com"
    for _ in range(5):
        assert await redis_integration.allow_login_attempt(key)
    assert not await redis_integration.allow_login_attempt(key)


@pytest.mark.asyncio
async def test_login_rate_limit_degrades_open_when_redis_breaks(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class BrokenRedis:
        async def incr(self, _key: str) -> int:
            raise OSError("redis unavailable")

    monkeypatch.setattr(redis_integration, "get_redis", lambda: BrokenRedis())

    assert await redis_integration.allow_login_attempt("login:broken@example.com")


@pytest.mark.asyncio
async def test_public_rate_limit_uses_bounded_memory_without_redis(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(redis_integration, "get_redis", lambda: None)
    redis_integration.reset_fallback_rate_limits()

    for _ in range(5):
        assert await redis_integration.allow_rate_limited_action("contact:visitor-a", 5, 3600)
    assert not await redis_integration.allow_rate_limited_action("contact:visitor-a", 5, 3600)
    assert await redis_integration.allow_rate_limited_action("contact:visitor-b", 5, 3600)


@pytest.mark.asyncio
async def test_public_rate_limit_falls_back_when_redis_breaks(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class BrokenRedis:
        async def incr(self, _key: str) -> int:
            raise OSError("redis unavailable")

    monkeypatch.setattr(redis_integration, "get_redis", lambda: BrokenRedis())
    redis_integration.reset_fallback_rate_limits()

    assert await redis_integration.allow_rate_limited_action("contact:fallback", 1, 3600)
    assert not await redis_integration.allow_rate_limited_action("contact:fallback", 1, 3600)


@pytest.mark.asyncio
async def test_public_rate_limit_fallback_expires(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    clock = [100.0]
    monkeypatch.setattr(redis_integration, "get_redis", lambda: None)
    monkeypatch.setattr(redis_integration, "monotonic", lambda: clock[0])
    redis_integration.reset_fallback_rate_limits()

    assert await redis_integration.allow_rate_limited_action("contact:expiring", 1, 60)
    assert not await redis_integration.allow_rate_limited_action("contact:expiring", 1, 60)
    clock[0] = 161.0
    assert await redis_integration.allow_rate_limited_action("contact:expiring", 1, 60)


def test_local_sqlite_database_is_allowed() -> None:
    settings = Settings(environment="local", database_url="sqlite:///./local.db")
    assert settings.database_url == "sqlite:///./local.db"


def test_production_rejects_sqlite_database() -> None:
    with pytest.raises(ValidationError, match="DATABASE_URL must point to PostgreSQL"):
        Settings(environment="production", database_url="sqlite:///./local.db")


def test_production_rejects_empty_database_url() -> None:
    with pytest.raises(ValidationError, match="DATABASE_URL must point to PostgreSQL"):
        Settings(environment="production", database_url="")


def test_production_accepts_postgres_database() -> None:
    settings = Settings(
        environment="production",
        database_url="postgresql+psycopg://user:password@example.com:5432/app",
    )
    assert settings.database_url.startswith("postgresql+psycopg://")


def test_frontend_and_api_route_precedence(client: TestClient) -> None:
    assert client.get("/").status_code == 200
    assert client.get("/dashboard/settings").status_code == 200
    assert client.get("/docs").status_code == 200
    assert client.get("/api/v1/health").json() == {"status": "ok"}


def test_login_me_logout_flow(client: TestClient) -> None:
    unauthenticated = client.get("/api/v1/auth/me")
    assert unauthenticated.status_code == 200
    assert unauthenticated.json() is None

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    assert login.status_code == 200
    assert login.json()["email"] == "admin@example.com"

    me = client.get("/api/v1/auth/me")
    assert me.status_code == 200

    logout = client.post("/api/v1/auth/logout", headers={"x-csrf-token": csrf(client)}, json={})
    assert logout.status_code == 200


def test_login_succeeds_when_redis_is_unavailable(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def allow_attempt(_key: str) -> bool:
        return True

    monkeypatch.setattr(auth_api, "allow_login_attempt", allow_attempt)
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    assert login.status_code == 200


def test_refresh_flow(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    refresh = client.post("/api/v1/auth/refresh")
    assert refresh.status_code == 200
    assert refresh.json()["email"] == "admin@example.com"


def test_mutations_require_csrf(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    response = client.post("/api/v1/items", json={"title": "No CSRF"})
    assert response.status_code == 403


def test_rbac_denies_normal_user(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "ChangeMe123!"},
    )
    response = client.get("/api/v1/admin/users")
    assert response.status_code == 403


def test_admin_can_list_users_and_roles(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    users = client.get("/api/v1/admin/users")
    assert users.status_code == 200
    assert "data" in users.json()
    assert client.get("/api/v1/admin/roles").status_code == 200


def test_admin_can_create_update_and_delete_user(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    email = f"user-{uuid4()}@example.com"
    created = client.post(
        "/api/v1/admin/users",
        headers={"x-csrf-token": csrf(client)},
        json={"email": email, "password": "ChangeMe123!", "full_name": "Created User"},
    )
    assert created.status_code == 200
    user_id = created.json()["id"]

    updated = client.patch(
        f"/api/v1/admin/users/{user_id}",
        headers={"x-csrf-token": csrf(client)},
        json={"full_name": "Updated User", "is_active": False},
    )
    assert updated.status_code == 200
    assert updated.json()["full_name"] == "Updated User"
    assert updated.json()["is_active"] is False

    deleted = client.delete(
        f"/api/v1/admin/users/{user_id}",
        headers={"x-csrf-token": csrf(client)},
    )
    assert deleted.status_code == 200


def test_admin_cannot_delete_self(client: TestClient) -> None:
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    admin_id = login.json()["id"]
    response = client.delete(
        f"/api/v1/admin/users/{admin_id}",
        headers={"x-csrf-token": csrf(client)},
    )
    assert response.status_code == 403


def test_user_can_update_profile_and_password_revokes_token(client: TestClient) -> None:
    email = f"profile-{uuid4()}@example.com"
    client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": "ChangeMe123!", "full_name": "Profile User"},
    )
    updated = client.patch(
        "/api/v1/auth/me",
        headers={"x-csrf-token": csrf(client)},
        json={"full_name": "Updated Demo User"},
    )
    assert updated.status_code == 200
    assert updated.json()["full_name"] == "Updated Demo User"

    changed = client.post(
        "/api/v1/auth/me/password",
        headers={"x-csrf-token": csrf(client)},
        json={"current_password": "ChangeMe123!", "new_password": "ChangeMe124!"},
    )
    assert changed.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 200
    assert client.get("/api/v1/auth/me").json() is None


def test_password_recovery_and_reset(client: TestClient) -> None:
    email = f"reset-{uuid4()}@example.com"
    client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": "ChangeMe123!", "full_name": "Reset User"},
    )
    recovery = client.post(
        "/api/v1/auth/password-recovery",
        json={"email": email},
    )
    assert recovery.status_code == 200

    token = create_password_reset_token(email, get_settings())
    reset = client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": "ChangeMe125!"},
    )
    assert reset.status_code == 200
    assert client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "ChangeMe125!"},
    ).status_code == 200


def test_user_can_delete_own_non_admin_account(client: TestClient) -> None:
    email = f"delete-{uuid4()}@example.com"
    signup = client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": "ChangeMe123!", "full_name": "Delete Me"},
    )
    assert signup.status_code == 200
    response = client.delete("/api/v1/auth/me", headers={"x-csrf-token": csrf(client)})
    assert response.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 200
    assert client.get("/api/v1/auth/me").json() is None


def test_admin_self_delete_is_blocked(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    response = client.delete("/api/v1/auth/me", headers={"x-csrf-token": csrf(client)})
    assert response.status_code == 403


def test_item_crud_and_ownership(client: TestClient) -> None:
    owner_email = f"owner-{uuid4()}@example.com"
    client.post(
        "/api/v1/auth/signup",
        json={"email": owner_email, "password": "ChangeMe123!", "full_name": "Owner User"},
    )
    created = client.post(
        "/api/v1/items",
        headers={"x-csrf-token": csrf(client)},
        json={"title": "User item", "description": "Private"},
    )
    assert created.status_code == 200
    item_id = created.json()["id"]

    listed = client.get("/api/v1/items")
    assert listed.status_code == 200
    assert listed.json()["count"] >= 1

    updated = client.patch(
        f"/api/v1/items/{item_id}",
        headers={"x-csrf-token": csrf(client)},
        json={"title": "Updated item"},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated item"

    client.post(
        "/api/v1/auth/signup",
        json={
            "email": f"other-{uuid4()}@example.com",
            "password": "ChangeMe123!",
            "full_name": "Other User",
        },
    )
    assert client.get(f"/api/v1/items/{item_id}").status_code == 403

    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    assert client.get(f"/api/v1/items/{item_id}").status_code == 200
    deleted = client.delete(
        f"/api/v1/items/{item_id}",
        headers={"x-csrf-token": csrf(client)},
    )
    assert deleted.status_code == 200


def test_removed_optional_demo_routes_are_not_exposed(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "ChangeMe123!"},
    )
    assert client.get("/api/v1/stats").status_code == 404
    assert client.post(
        "/api/v1/integrations/supabase/upload-url",
        headers={"x-csrf-token": csrf(client)},
        json={"path": "avatar.png"},
    ).status_code == 404
