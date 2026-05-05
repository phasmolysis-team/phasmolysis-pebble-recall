from app.models.moods import MoodLogs
from app.middlewares.auth import check_if_logged_in, check_encrypted_cookie_auth
from app.core.security.jwt_service import JwtService, Claims, get_jwt_service
from sqlalchemy.exc import NoResultFound
from datetime import UTC
import datetime
from starlette.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_200_OK,
    HTTP_409_CONFLICT,
    HTTP_201_CREATED,
    HTTP_406_NOT_ACCEPTABLE, HTTP_404_NOT_FOUND,
)
from cryptography.exceptions import InvalidKey
from app.core.security.kdf_pass import get_kdf
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id
from app.models.users import Users, UserWithoutPassword, BaseUsers

from app.core.database import get_session
from app.schemas.cookies import (
    set_default_cookie_params,
    set_default_cookie_params_with_encryption,
    decode_encrypted_cookie,
)
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Annotated, Literal
from fastapi import APIRouter, Form, Depends, HTTPException, Response, Request
from pydantic import BaseModel
from sqlmodel import select, or_, desc

router = APIRouter()

@router.get(path="/moods")
async def get_mood_logs(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
):
    if not is_logged_in:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)
    statement = select(Users).where(Users.email == claims.sub)
    results = await session.exec(statement)
    user = results.one_or_none()
    if user is None:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR)
    statement = select(MoodLogs).where(MoodLogs.user_id == user.id)
    results = await session.exec(statement)
    logs = results.fetchall()
    return logs

@router.get(path="/moods/latest")
async def get_mood_logs_latest(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
):
    if not is_logged_in:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)
    statement = select(Users).where(Users.email == claims.sub)
    results = await session.exec(statement)
    user = results.one_or_none()
    if user is None:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR)
    statement = select(MoodLogs).where(MoodLogs.user_id == user.id).order_by(desc(MoodLogs.id))
    results = await session.exec(statement)
    logs = results.first()
    return logs
