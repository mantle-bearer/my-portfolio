"""Application settings loaded from environment variables."""

from functools import lru_cache
from typing import Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the FastAPI application."""

    app_name: str = "Goodluck Igbokwe Portfolio"
    app_version: str = "0.1.0"
    environment: Literal["local", "test", "production"] = "local"
    database_url: str = "sqlite:///./local.db"
    redis_url: str | None = None

    jwt_secret: str = "change-me-in-production-with-at-least-32-bytes"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 15
    refresh_token_days: int = 14
    csrf_cookie_name: str = "csrf_token"
    access_cookie_name: str = "access_token"
    refresh_cookie_name: str = "refresh_token"
    cookie_secure: bool = False
    cookie_domain: str | None = None
    cors_origins: str = "http://localhost:5173"
    enable_signup: bool = False
    public_base_url: str = "http://127.0.0.1:8000"

    admin_email: str | None = None
    admin_password: str | None = None

    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_tls: bool = True
    emails_from_email: str | None = None
    password_reset_token_minutes: int = 30

    media_root: str = "./media"
    media_max_bytes: int = 8 * 1024 * 1024
    contact_body_max_bytes: int = 16 * 1024
    contact_rate_limit: int = 5
    contact_rate_window_seconds: int = 3600

    git_sha: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def is_production(self) -> bool:
        """Return whether the application is running in production."""
        return self.environment == "production"

    @field_validator(
        "smtp_host",
        "smtp_user",
        "smtp_password",
        "emails_from_email",
        mode="before",
    )
    @classmethod
    def empty_string_to_none(cls, value: str | None) -> str | None:
        """Normalize empty optional string settings to None."""
        if value == "":
            return None
        return value

    @model_validator(mode="after")
    def require_postgres_in_production(self) -> "Settings":
        """Reject local SQLite databases when production mode is enabled."""
        if self.is_production and (
            not self.database_url.strip() or self.database_url.startswith("sqlite")
        ):
            message = "DATABASE_URL must point to PostgreSQL when ENVIRONMENT=production."
            raise ValueError(message)
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins from the environment."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()
