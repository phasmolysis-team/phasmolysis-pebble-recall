from uuid import uuid7
from pydantic import BaseModel, Json
from app.models.moods import MoodLogs, MoodLogsWithTimestamp
from app.middlewares.auth import check_if_logged_in, check_encrypted_cookie_auth
from app.core.security.jwt_service import Claims
from starlette.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from app.models.users import Users

from app.core.database import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request 
from sqlmodel import select, desc

router = APIRouter()

class MoodLogsParams(BaseModel):
    valence: float
    arousal: float


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
    return [MoodLogsWithTimestamp(**log.model_dump()) for log in logs]


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
    statement = (
        select(MoodLogs).where(MoodLogs.user_id == user.id).order_by(desc(MoodLogs.id))
    )
    results = await session.exec(statement)
    logs = results.first()
    if logs:
        ret = MoodLogsWithTimestamp(**logs.model_dump())
        return ret
    return logs


@router.post(path="/moods")
async def add_mood_logs(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    payload: MoodLogsParams,
):
    if not is_logged_in:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)
    statement = select(Users).where(Users.email == claims.sub)
    results = await session.exec(statement)
    user = results.one_or_none()
    if user is None:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR)

    if user.id is None:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR)
    id = uuid7()
    mood_log = MoodLogs(
        id=id, user_id=user.id, valence=payload.valence, arousal=payload.arousal
    )
    session.add(mood_log)
    await session.commit()
    await session.refresh(mood_log)

    return MoodLogsWithTimestamp(**mood_log.model_dump())

