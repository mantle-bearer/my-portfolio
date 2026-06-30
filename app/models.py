"""SQLModel database models for users, roles, permissions, and items."""

from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


def utcnow() -> datetime:
    """Return the current UTC timestamp."""
    return datetime.now(UTC)


class UserRoleLink(SQLModel, table=True):
    """Many-to-many link between users and roles."""

    user_id: UUID = Field(foreign_key="user.id", primary_key=True)
    role_id: UUID = Field(foreign_key="role.id", primary_key=True)


class RolePermissionLink(SQLModel, table=True):
    """Many-to-many link between roles and permissions."""

    role_id: UUID = Field(foreign_key="role.id", primary_key=True)
    permission_id: UUID = Field(foreign_key="permission.id", primary_key=True)


class Permission(SQLModel, table=True):
    """Permission granted to roles."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    code: str = Field(index=True, unique=True)
    description: str = ""
    roles: list["Role"] = Relationship(back_populates="permissions", link_model=RolePermissionLink)


class Role(SQLModel, table=True):
    """Role grouping permissions for users."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: str = ""
    permissions: list[Permission] = Relationship(
        back_populates="roles", link_model=RolePermissionLink
    )
    users: list["User"] = Relationship(back_populates="roles", link_model=UserRoleLink)


class User(SQLModel, table=True):
    """Application user with cookie session versioning."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: str | None = None
    hashed_password: str
    is_active: bool = True
    token_version: int = 0
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    roles: list[Role] = Relationship(back_populates="users", link_model=UserRoleLink)
    items: list["Item"] = Relationship(back_populates="owner")


class Item(SQLModel, table=True):
    """User-owned item managed by the template CRUD UI."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(index=True)
    description: str | None = None
    owner_id: UUID = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    owner: User | None = Relationship(back_populates="items")
