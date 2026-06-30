"""Command-line helpers for database setup and local seed data."""

import argparse

from sqlmodel import Session

from app.core.config import get_settings
from app.db.session import create_db_and_tables, engine
from app.seed import seed_admin, seed_local_demo, seed_roles


def main() -> None:
    """Run the selected app management command."""
    parser = argparse.ArgumentParser(prog="app")
    subcommands = parser.add_subparsers(dest="command", required=True)
    subcommands.add_parser("init-db")
    subcommands.add_parser("seed-local")
    subcommands.add_parser("seed-admin")
    args = parser.parse_args()
    settings = get_settings()
    create_db_and_tables()
    with Session(engine) as session:
        if args.command == "init-db":
            seed_roles(session)
        elif args.command == "seed-local":
            seed_local_demo(session)
        elif args.command == "seed-admin":
            if not settings.admin_email or not settings.admin_password:
                raise SystemExit("ADMIN_EMAIL and ADMIN_PASSWORD are required")
            seed_admin(session, settings.admin_email, settings.admin_password)


if __name__ == "__main__":
    main()
