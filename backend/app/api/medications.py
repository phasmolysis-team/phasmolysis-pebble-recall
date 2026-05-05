from app.models.medication import TMedication, FreqUnit, DosageUnit
import datetime
from app.models.medication_logs import MedicationLogs, MedicationLogsWithTimestamp
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

class TMedicationParams(BaseModel):
    name: str
    frequency: int
    frequency_unit: FreqUnit |str
    frequency_times_per_unit: int
    recommended_dosage: float
    recommended_dosage_unit: DosageUnit | str

@router.get(path="/medications/logs")
async def get_medication_logs(
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
    statement = select(MedicationLogs).where(MedicationLogs.user_id == user.id)
    results = await session.exec(statement)
    logs = results.all()
    if logs:
        return [MedicationLogsWithTimestamp(**log.model_dump()) for log in logs]
    return logs

@router.get(path="/medications/logs/latest")
async def get_medication_logs_latest(
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
        select(MedicationLogs).where(MedicationLogs.user_id == user.id).order_by(desc(MedicationLogs.id))
    )
    results = await session.exec(statement)
    logs = results.first()
    if logs:
        ret = MedicationLogsWithTimestamp(**logs.model_dump())
        return ret
    return logs


@router.get(path="/medications/logs/{date}")
async def get_medication_logs_with_date(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    date: datetime.datetime
):
    if not is_logged_in:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)
    statement = select(Users).where(Users.email == claims.sub)
    results = await session.exec(statement)
    user = results.one_or_none()
    if user is None:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR)

    statement = (
        select(MedicationLogs).where(MedicationLogs.user_id == user.id).order_by(desc(MedicationLogs.id))
    )
    day = date.day
    results = await session.exec(statement)
    logs = results.first()
    if logs:
        ret = MedicationLogsWithTimestamp(**logs.model_dump())
        if ret.timestamp.day == day:
            return []
        return ret
    return logs

@router.post(path="/medications/logs")
async def add_medication_logs(
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

    pass

@router.post(path="/medications")
async def add_new_medication(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    payload: TMedicationParams
):
    if not is_logged_in:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)

    id = uuid7()
    medicine = TMedication(id=id, **payload.model_dump())

    session.add(medicine)
    await session.commit()
    await session.refresh(medicine)
    return medicine

@router.get(path="/medications")
async def get_medications(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
):
    if not is_logged_in:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)

    statement = select(TMedication)
    results = await session.exec(statement)
    return results.all()



    
