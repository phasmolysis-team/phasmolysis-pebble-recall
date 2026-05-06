import datetime
import sqlalchemy as sa
from typing import Annotated, Literal, List

from sqlmodel import SQLModel, Field, Column
from pydantic import EmailStr, BaseModel
from pydantic_extra_types.phone_numbers import PhoneNumber


class AllPhone(PhoneNumber):
    default_region_code = "PH"
    supported_regions = []
    phone_format = "INTERNATIONAL"


class BaseUsers(SQLModel, table=False):
    username: str | None = None
    email: EmailStr
    contact_number: AllPhone
    professional_license_id: str | None = None
    password: str


class Users(BaseUsers, table=True):
    id: Annotated[int | None, Field(primary_key=True)] = None
    role: Annotated[
        List[Literal["patient", "professional"]],
        Field(sa_column=Column(sa.ARRAY(sa.TEXT), nullable=False)),
    ]
    created_at: Annotated[
        datetime.datetime,
        Field(sa_column=Column(sa.TIMESTAMP(timezone=True), nullable=False)),
    ]
    updated_at: Annotated[
        datetime.datetime,
        Field(sa_column=Column(sa.TIMESTAMP(timezone=True), nullable=True)),
    ]
    disabled: Annotated[bool, Field(sa_column=Column(sa.BOOLEAN, nullable=False))]


class UserWithoutPassword(BaseModel):
    username: str | None = None
    email: EmailStr
    contact_number: str
    professional_license_id: str | None = None


class UpdateUser(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    contact_number: str | None = None
    password: str | None = None
    professional_license_id: str | None = None
