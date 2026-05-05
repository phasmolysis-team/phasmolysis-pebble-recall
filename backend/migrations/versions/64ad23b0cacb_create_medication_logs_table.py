"""create medication logs table

Revision ID: 64ad23b0cacb
Revises: 5f6a952c25c3
Create Date: 2026-05-05 10:41:35.263675

"""
from uuid import uuid7
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '64ad23b0cacb'
down_revision: Union[str, Sequence[str], None] = '5f6a952c25c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    columns = [
        sa.Column(
            "id", sa.UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid7
        ),
        sa.Column(
            "user_id",
            sa.ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
            nullable=False,
        ),
        sa.Column("side_effects", sa.Text, nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_users_user_id"),
    ]

    op.create_table("medication_logs", *columns)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("medication_logs", if_exists=True)
