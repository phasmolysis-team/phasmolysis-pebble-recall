import asyncio
import uuid
from app.models.medication import TMedication, FreqUnit, DosageUnit
import datetime
from app.models.medication_logs import MedicationLogs, MedicationLogsWithTimestamp
from uuid import uuid7, UUID
from pydantic import BaseModel, UUID7
from app.models.moods import MoodLogs, MoodLogsWithTimestamp
from app.middlewares.auth import check_if_logged_in, check_encrypted_cookie_auth
from app.core.security.jwt_service import Claims
from starlette.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_404_NOT_FOUND,
)
from app.models.users import Users

from app.core.database import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Annotated, cast
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import select, desc, or_

router = APIRouter()

class MedicationLogsMatrixParams(BaseModel):
    medications: list[str]
    side_effects: str = ""
    custom_date: datetime.datetime | None = None


class MedicationLogsParams(BaseModel):
    medication: str
    side_effects: str = ""
    custom_date: datetime.datetime | None = None


class TMedicationParams(BaseModel):
    name: str
    frequency: int
    frequency_unit: FreqUnit | str
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
    statement = (
        select(MedicationLogs)
        .where(MedicationLogs.user_id == user.id)
        .order_by(desc(MedicationLogs.id))
    )
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
        select(MedicationLogs)
        .where(MedicationLogs.user_id == user.id)
        .order_by(desc(MedicationLogs.id))
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
    date: datetime.datetime,
):
    if not is_logged_in:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)
    statement = select(Users).where(Users.email == claims.sub)
    results = await session.exec(statement)
    user = results.one_or_none()
    if user is None:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR)

    statement = (
        select(MedicationLogs)
        .where(MedicationLogs.user_id == user.id)
        .order_by(desc(MedicationLogs.id))
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


async def _add_medication_logs(
    session: AsyncSession, payload: MedicationLogsParams, user: Users
):
    if payload.custom_date is not None:
        ts = int(payload.custom_date.timestamp() * 1000)
        id = uuid.uuid8(a=ts)
        c_ = str(id)
        id = uuid.UUID(c_, version=7)
    else:
        id = uuid7()

    try:
        medication_t = uuid.UUID(payload.medication, version=7)
    except ValueError:
        medication_t = payload.medication

    if isinstance(medication_t, UUID):
        statement = select(TMedication).where(TMedication.id == medication_t)
        results = await session.exec(statement)
        tmedication = results.first()
        if tmedication is None:
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND,
                detail="no such medication found based on id",
            )
        log = MedicationLogs(
            id=id,
            user_id=cast(int, user.id),
            medication_id=tmedication.id,
            medication_name=tmedication.name,
            user_noted_side_effects=payload.side_effects,
        )
        session.add(log)
        await session.commit()
        await session.refresh(log)
        return log

    log = MedicationLogs(
        id=id,
        user_id=cast(int, user.id),
        medication_id=None,
        medication_name=medication_t,
        user_noted_side_effects=payload.side_effects,
    )
    session.add(log)
    await session.commit()
    await session.refresh(log)
    return log


@router.post(path="/medications/logs")
async def add_medication_logs(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    payload: MedicationLogsParams,
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
    log = await _add_medication_logs(session, payload, user)
    return log



@router.post(path="/medications")
async def add_new_medication(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    payload: TMedicationParams,
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


@router.post(path="/side-effects/new")
async def add_medication_logs_matrix(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    payload: MedicationLogsMatrixParams,
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

    tasks = []

    for medication in payload.medications:
        medication_logs_params = MedicationLogsParams(
            medication=medication,
            custom_date=payload.custom_date,
            side_effects=payload.side_effects
        )
        task = _add_medication_logs(session, medication_logs_params, user)
        tasks.append(task)

    results = await asyncio.gather(*tasks)
    return results

@router.post(path="/side-effects/retrieve")
async def get_medication_logs_matrix(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    payload: MedicationLogsMatrixParams,
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

    q = []
    for medication in payload.medications:
        try:
            uid = uuid.UUID(medication, version=7)
            q.append(MedicationLogs.medication_id == uid)
        except ValueError:
            q.append(MedicationLogs.medication_name == medication)
    
    statement = select(MedicationLogs).where(or_(*q)).order_by(desc(MedicationLogs.id))
    results = await session.exec(statement)
    return results.all()

