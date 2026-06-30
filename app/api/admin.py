"""Admin endpoints for users, roles, and permissions."""

from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, delete, func, select

from app.auth.dependencies import require_permission, verify_csrf
from app.auth.security import hash_password
from app.db.session import get_session
from app.models import Item, Role, User
from app.schemas import (
    AdminUserCreate,
    AdminUserUpdate,
    Message,
    RoleAssignment,
    RoleRead,
    UserList,
    UserRead,
)

router = APIRouter(prefix="/admin", tags=["admin"])


def roles_by_name(session: Session, role_names: list[str]) -> list[Role]:
    """Resolve role names to role models or raise for unknown roles."""
    roles = list(session.exec(select(Role).where(Role.name.in_(role_names))).all())
    if len(roles) != len(set(role_names)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown role")
    return roles


@router.get("/users", response_model=UserList)
def list_users(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("users:read")),
) -> UserList:
    """List users for the admin table."""
    count = session.exec(select(func.count()).select_from(User)).one()
    users = list(session.exec(select(User).offset(skip).limit(limit)).all())
    return UserList(data=[UserRead.model_validate(user) for user in users], count=count)


@router.post(
    "/users",
    response_model=UserRead,
    dependencies=[Depends(verify_csrf)],
)
def create_user(
    body: AdminUserCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("users:write")),
) -> User:
    """Create a user from the admin interface."""
    if session.exec(select(User).where(User.email == body.email.lower())).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = User(
        email=body.email.lower(),
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        roles=roles_by_name(session, body.role_names),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.patch(
    "/users/{user_id}/roles",
    response_model=UserRead,
    dependencies=[Depends(verify_csrf)],
)
def assign_roles(
    user_id: UUID,
    body: RoleAssignment,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("roles:write")),
) -> User:
    """Replace a user's roles."""
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.roles = roles_by_name(session, body.role_names)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.patch(
    "/users/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(verify_csrf)],
)
def update_user(
    user_id: UUID,
    body: AdminUserUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("users:write")),
) -> User:
    """Update a user's profile, password, activation, or roles."""
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if body.email and body.email.lower() != user.email:
        existing = session.exec(select(User).where(User.email == body.email.lower())).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        user.email = body.email.lower()
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.password:
        user.hashed_password = hash_password(body.password)
        user.token_version += 1
    if body.is_active is not None:
        user.is_active = body.is_active
        if not body.is_active:
            user.token_version += 1
    if body.role_names is not None:
        user.roles = roles_by_name(session, body.role_names)
    user.updated_at = datetime.now(UTC)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.delete(
    "/users/{user_id}",
    response_model=Message,
    dependencies=[Depends(verify_csrf)],
)
def delete_user(
    user_id: UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_permission("users:write")),
) -> Message:
    """Delete a user and their owned items."""
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot delete themselves",
        )
    session.exec(delete(Item).where(Item.owner_id == user.id))
    session.delete(user)
    session.commit()
    return Message(message="User deleted")


@router.get("/roles", response_model=list[RoleRead])
def list_roles(
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("roles:read")),
) -> list[Role]:
    """List all built-in roles."""
    return list(session.exec(select(Role)).all())
