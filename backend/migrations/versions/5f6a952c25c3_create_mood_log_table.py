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
    op.create_table(
        "mood_logs",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), nullable=False),
        sa.Column("valence", sa.Float(), server_default="0.0", nullable=False),
        sa.Column("arousal", sa.Float(), server_default="0.0", nullable=False),
        # Use the explicit constraint OR the inline one, but not both
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_users_user_id", 
            ondelete="CASCADE", onupdate="CASCADE"
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("mood_logs", if_exists=True)
