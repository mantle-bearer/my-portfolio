"""Pydantic schemas for API request and response payloads."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PermissionRead(BaseModel):
    """Permission data exposed to the frontend."""

    model_config = ConfigDict(from_attributes=True)

    code: str
    description: str


class RoleRead(BaseModel):
    """Role data with attached permissions."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str
    permissions: list[PermissionRead] = []


class UserRead(BaseModel):
    """Public user data returned by account and admin endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    full_name: str | None = None
    is_active: bool
    roles: list[RoleRead] = []


class UserList(BaseModel):
    """Paginated user list response."""

    data: list[UserRead]
    count: int


class UserCreate(BaseModel):
    """Payload for creating a self-service user account."""

    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None


class AdminUserCreate(UserCreate):
    """Payload for creating a user from the admin interface."""

    role_names: list[str] = Field(default_factory=lambda: ["user"])


class AdminUserUpdate(BaseModel):
    """Payload for admin-managed user updates."""

    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = Field(default=None, min_length=8)
    is_active: bool | None = None
    role_names: list[str] | None = None


class LoginRequest(BaseModel):
    """Email and password login payload."""

    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    """Payload for updating the current user's profile."""

    full_name: str | None = None
    email: EmailStr | None = None


class PasswordChange(BaseModel):
    """Payload for changing the current user's password."""

    current_password: str
    new_password: str = Field(min_length=8)


class PasswordRecoveryRequest(BaseModel):
    """Payload for requesting a password recovery email."""

    email: EmailStr


class PasswordResetRequest(BaseModel):
    """Payload for completing password reset with a token."""

    token: str
    new_password: str = Field(min_length=8)


class Message(BaseModel):
    """Generic message response."""

    message: str


class RoleAssignment(BaseModel):
    """Payload for assigning roles to a user."""

    role_names: list[str]


class ItemRead(BaseModel):
    """Item data returned by item endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None = None
    owner_id: UUID


class ItemList(BaseModel):
    """Paginated item list response."""

    data: list[ItemRead]
    count: int


class ItemCreate(BaseModel):
    """Payload for creating an item."""

    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


class ItemUpdate(BaseModel):
    """Payload for updating an item."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)
