from uuid import uuid7
from typing import Annotated
from sqlmodel import SQLModel, Field
from pydantic import UUID7
import datetime
import sqlalchemy as sa


class MedicationLogs(SQLModel, table=True):
    __tablename__ = "medication_logs"
    id: Annotated[
        UUID7,
        Field(
            primary_key=True,
        ),
    ] = uuid7()
    user_id: Annotated[
        int,
        Field(sa_column=sa.Column(sa.Integer)),
    ]
    medication_name: Annotated[str | None, Field(sa_column=sa.Column(sa.Text))] = None
    medication_id: Annotated[UUID7 | None, Field(sa_column=sa.Column(sa.UUID))] = None
    user_noted_side_effects: Annotated[str, Field(sa_column=sa.Column(sa.Text))]


class MedicationLogsWithTimestamp(MedicationLogs, table=False):
    timestamp: Annotated[datetime.datetime, Field()]

    def __init__(self, **args):
        super().__init__(**args)
        self.timestamp = datetime.datetime.fromtimestamp(self.id.time)
