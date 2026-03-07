"""add image url columns for cloudinary

Revision ID: 0002_cloudinary_images
Revises: 0001_initial
Create Date: 2026-03-07
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_cloudinary_images"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.Text(), nullable=True))
    op.add_column("organizations", sa.Column("logo_url", sa.Text(), nullable=True))
    op.add_column("opportunities", sa.Column("image_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("opportunities", "image_url")
    op.drop_column("organizations", "logo_url")
    op.drop_column("users", "avatar_url")
