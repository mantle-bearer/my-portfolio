"""FastAPI application factory and route registration."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.api import admin, auth, health, items
from app.core.config import get_settings
from app.db.session import create_db_and_tables, engine
from app.seed import seed_local_demo, seed_roles

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Create local tables and seed baseline roles before serving requests."""
    if settings.environment in {"local", "test"}:
        create_db_and_tables()
        with Session(engine) as session:
            seed_local_demo(session)
    else:
        with Session(engine) as session:
            seed_roles(session)
    yield


app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


api_prefix = "/api/v1"
app.include_router(health.router, prefix=api_prefix)
app.include_router(auth.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(items.router, prefix=api_prefix)


@app.api_route(
    f"{api_prefix}/{{path:path}}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
)
async def missing_api_route(path: str) -> None:
    """Return API 404s before the frontend fallback handles unknown paths."""
    raise HTTPException(status_code=404, detail=f"API route not found: {path}")

dist_dir = Path("dist")
if hasattr(app, "frontend"):
    app.frontend("/", directory=str(dist_dir), fallback="index.html", check_dir=False)
