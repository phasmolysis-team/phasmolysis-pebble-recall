"""add sample table

Revision ID: 8cb74e1b41adRevises:
Create Date: 2026-04-06 19:37:33.157484

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8cb74e1b41ad"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sample",
        sa.Column(
            "id", sa.Integer, primary_key=True, nullable=False, autoincrement=True
        ),
        sa.Column("sample_column", sa.Text, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("sample", if_exists=True)

