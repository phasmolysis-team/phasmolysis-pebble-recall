"""create medication table

Revision ID: 22ad5e197d74
Revises: 64ad23b0cacb
Create Date: 2026-05-05 11:18:10.667389

"""
from uuid import uuid7
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '22ad5e197d74'
down_revision: Union[str, Sequence[str], None] = '64ad23b0cacb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    columns = [
        sa.Column(
            "id", sa.UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid7
        ),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('frequency', sa.Integer, nullable=False),
        sa.Column('frequency_unit', sa.Text, nullable=False),
        sa.Column('frequency_times_per_unit', sa.Integer, nullable=False),
        sa.Column('recommended_dosage', sa.Float, nullable=False),
        sa.Column('recommended_dosage_unit', sa.Text, nullable=False),
    ]
    op.create_table("medication", *columns)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("medication", if_exists=True)
