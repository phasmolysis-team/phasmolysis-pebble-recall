import uuid
from datetime import UTC
import datetime
from uuid import uuid7, UUID
from pydantic import UUID7
from sqlmodel import SQLModel, Field
import sqlalchemy as sa
from typing import Annotated


# NOTE: A mood is just a wrapper for emotions
class MoodLogs(SQLModel, table=True):
    __tablename__ = "mood_logs"
    id: Annotated[
        str,
        Field(
            primary_key=True,
        ),
    ]
    user_id: Annotated[
        int,
        Field(sa_column=sa.Column(sa.Integer)),
    ]
    valence: Annotated[float, Field(sa_column=sa.Column(sa.Float))] = 0.0
    arousal: Annotated[float, Field(sa_column=sa.Column(sa.Float))] = 0.0


class MoodLogsWithTimestamp(MoodLogs, table=False):
    timestamp: Annotated[datetime.datetime, Field()]

    def __init__(self, **args):
        super().__init__(**args)
        uid = uuid.UUID(self.id,  version=7)
        self.timestamp = datetime.datetime.fromtimestamp(uid.time/ 1000)
