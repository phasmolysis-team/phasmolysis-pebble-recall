"""create users table

Revision ID: a5f7ad507978
Revises:
Create Date: 2026-05-04 13:00:00.196531

"""

from sqlalchemy.sql.functions import now

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a5f7ad507978"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    columns = [
        sa.Column(
            "id", sa.Integer, primary_key=True, nullable=False, autoincrement=True
        ),
        sa.Column("role", sa.ARRAY(sa.Text), nullable=False, default="patient"),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), nullable=False, default=now()
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), nullable=False, default=now()
        ),        sa.Column("disabled", sa.Boolean, nullable=False, default=False),
        sa.Column("username", sa.Text, nullable=True),
        sa.Column("email", sa.Text, nullable=False, unique=True),
        sa.Column("contact_number", sa.Text, nullable=False, unique=True),
        sa.Column("professional_license_id", sa.Text, nullable=True, unique=True),
        sa.Column("password", sa.Text, nullable=False),
    ]

    op.create_table("users", *columns)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("users", if_exists=True)

