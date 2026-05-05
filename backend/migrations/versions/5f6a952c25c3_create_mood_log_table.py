"""create mood log table

Revision ID: 5f6a952c25c3
Revises: a5f7ad507978
Create Date: 2026-05-05 09:14:22.292592

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from uuid import uuid7


# revision identifiers, used by Alembic.
revision: str = "5f6a952c25c3"
down_revision: Union[str, Sequence[str], None] = "a5f7ad507978"
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
        sa.Column("valence", sa.Float, default=0.0, nullable=False),
        sa.Column("arousal", sa.Float, default=0.0, nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_users_user_id"),
    ]

    op.create_table("mood_logs", *columns)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("mood_logs", if_exists=True)
