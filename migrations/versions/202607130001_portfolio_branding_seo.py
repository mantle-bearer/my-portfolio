"""add editable portfolio branding and seo controls

Revision ID: 202607130001
Revises: 8d6b927b3d83
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202607130001"
down_revision: str | None = "8d6b927b3d83"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    for name in (
        "brand_logo_light_media_id",
        "brand_logo_dark_media_id",
        "brand_mark_light_media_id",
        "brand_mark_dark_media_id",
        "favicon_media_id",
        "og_image_media_id",
        "twitter_image_media_id",
    ):
        op.add_column("portfolio_site", sa.Column(name, sa.Uuid(), nullable=True))

    defaults = {
        "brand_logo_alt": "Goodluck Igbokwe",
        "canonical_url": "",
        "robots_directive": "index,follow",
        "og_title": "",
        "og_description": "",
        "twitter_card": "summary_large_image",
        "twitter_title": "",
        "twitter_description": "",
        "theme_color": "#06245a",
    }
    for name, value in defaults.items():
        op.add_column(
            "portfolio_site",
            sa.Column(name, sa.Text(), nullable=False, server_default=value),
        )

    with op.batch_alter_table("portfolio_site", recreate="always") as batch_op:
        for name in (
            "brand_logo_light_media_id",
            "brand_logo_dark_media_id",
            "brand_mark_light_media_id",
            "brand_mark_dark_media_id",
            "favicon_media_id",
            "og_image_media_id",
            "twitter_image_media_id",
        ):
            batch_op.create_foreign_key(
                f"fk_portfolio_site_{name}",
                "media_asset",
                [name],
                ["id"],
                ondelete="SET NULL",
            )


def downgrade() -> None:
    for name in (
        "brand_logo_light_media_id",
        "brand_logo_dark_media_id",
        "brand_mark_light_media_id",
        "brand_mark_dark_media_id",
        "favicon_media_id",
        "og_image_media_id",
        "twitter_image_media_id",
    ):
        op.drop_constraint(f"fk_portfolio_site_{name}", "portfolio_site", type_="foreignkey")
        op.drop_column("portfolio_site", name)
    for name in (
        "brand_logo_alt",
        "canonical_url",
        "robots_directive",
        "og_title",
        "og_description",
        "twitter_card",
        "twitter_title",
        "twitter_description",
        "theme_color",
    ):
        op.drop_column("portfolio_site", name)
