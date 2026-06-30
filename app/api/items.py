"""Item CRUD endpoints with ownership-aware authorization."""

from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, func, select

from app.auth.dependencies import require_permission, verify_csrf
from app.db.session import get_session
from app.models import Item, User
from app.schemas import ItemCreate, ItemList, ItemRead, ItemUpdate, Message

router = APIRouter(prefix="/items", tags=["items"])


def is_admin(user: User) -> bool:
    """Return whether a user has the admin role."""
    return any(role.name == "admin" for role in user.roles)


def ensure_item_access(item: Item, user: User) -> None:
    """Require item ownership unless the user is an admin."""
    if not is_admin(user) and item.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")


@router.get("", response_model=ItemList)
def list_items(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    user: User = Depends(require_permission("items:read")),
) -> ItemList:
    """List items visible to the current user."""
    if is_admin(user):
        count = session.exec(select(func.count()).select_from(Item)).one()
        items = list(session.exec(select(Item).offset(skip).limit(limit)).all())
    else:
        owned_items = select(Item).where(Item.owner_id == user.id)
        count = session.exec(
            select(func.count()).select_from(Item).where(Item.owner_id == user.id)
        ).one()
        items = list(session.exec(owned_items.offset(skip).limit(limit)).all())
    return ItemList(data=[ItemRead.model_validate(item) for item in items], count=count)


@router.post("", response_model=ItemRead, dependencies=[Depends(verify_csrf)])
def create_item(
    body: ItemCreate,
    session: Session = Depends(get_session),
    user: User = Depends(require_permission("items:write")),
) -> Item:
    """Create an item owned by the current user."""
    item = Item(title=body.title, description=body.description, owner_id=user.id)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/{item_id}", response_model=ItemRead)
def read_item(
    item_id: UUID,
    session: Session = Depends(get_session),
    user: User = Depends(require_permission("items:read")),
) -> Item:
    """Read one item when visible to the current user."""
    item = session.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    ensure_item_access(item, user)
    return item


@router.patch("/{item_id}", response_model=ItemRead, dependencies=[Depends(verify_csrf)])
def update_item(
    item_id: UUID,
    body: ItemUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(require_permission("items:write")),
) -> Item:
    """Update one item when writable by the current user."""
    item = session.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    ensure_item_access(item, user)
    if body.title is not None:
        item.title = body.title
    if body.description is not None:
        item.description = body.description
    item.updated_at = datetime.now(UTC)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}", response_model=Message, dependencies=[Depends(verify_csrf)])
def delete_item(
    item_id: UUID,
    session: Session = Depends(get_session),
    user: User = Depends(require_permission("items:write")),
) -> Message:
    """Delete one item when writable by the current user."""
    item = session.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    ensure_item_access(item, user)
    session.delete(item)
    session.commit()
    return Message(message="Item deleted")
