"""Seed built-in roles and demo users."""

from sqlmodel import Session, select

from app.auth.security import hash_password
from app.models import Permission, Role, User

BUILTIN_PERMISSIONS = {
    "users:read": "Read users",
    "users:write": "Create, update, and deactivate users",
    "roles:read": "Read roles",
    "roles:write": "Assign built-in roles",
    "items:read": "Read owned items",
    "items:write": "Create, update, and delete owned items",
}


def seed_roles(session: Session) -> None:
    """Create or update built-in roles and permissions."""
    permissions: dict[str, Permission] = {}
    for code, description in BUILTIN_PERMISSIONS.items():
        permission = session.exec(select(Permission).where(Permission.code == code)).first()
        if permission is None:
            permission = Permission(code=code, description=description)
            session.add(permission)
        permissions[code] = permission

    admin = session.exec(select(Role).where(Role.name == "admin")).first()
    if admin is None:
        admin = Role(name="admin", description="Full administrator")
        session.add(admin)
    admin.permissions = list(permissions.values())

    user = session.exec(select(Role).where(Role.name == "user")).first()
    if user is None:
        user = Role(name="user", description="Authenticated user")
        session.add(user)
    user.permissions = [permissions["items:read"], permissions["items:write"]]
    session.commit()


def seed_admin(
    session: Session,
    email: str,
    password: str,
    full_name: str = "Admin",
    update_password: bool = True,
) -> User:
    """Create or update an administrator account."""
    seed_roles(session)
    admin_role = session.exec(select(Role).where(Role.name == "admin")).one()
    user = session.exec(select(User).where(User.email == email.lower())).first()
    if user is None:
        user = User(
            email=email.lower(),
            full_name=full_name,
            hashed_password=hash_password(password),
            roles=[admin_role],
        )
        session.add(user)
    else:
        if update_password:
            user.hashed_password = hash_password(password)
        user.is_active = True
        if admin_role not in user.roles:
            user.roles.append(admin_role)
    session.commit()
    session.refresh(user)
    return user


def seed_local_demo(session: Session) -> None:
    """Create local demo admin and user accounts."""
    seed_admin(session, "admin@example.com", "ChangeMe123!", "Demo Admin", update_password=False)
    user_role = session.exec(select(Role).where(Role.name == "user")).one()
    user = session.exec(select(User).where(User.email == "user@example.com")).first()
    if user is None:
        session.add(
            User(
                email="user@example.com",
                full_name="Demo User",
                hashed_password=hash_password("ChangeMe123!"),
                roles=[user_role],
            )
        )
        session.commit()
