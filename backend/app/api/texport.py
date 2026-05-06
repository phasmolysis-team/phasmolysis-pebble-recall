import json
from app.core.genai import ai_client
from app.models.moods import MoodLogs, MoodLogsWithTimestamp
from fastapi.responses import FileResponse
from tempfile import NamedTemporaryFile
import pandas as pd
import typst
import os
from app.models.medication_logs import MedicationLogs, MedicationLogsWithTimestamp
from pydantic import BaseModel
from app.middlewares.auth import check_if_logged_in, check_encrypted_cookie_auth
from app.core.security.jwt_service import Claims
from starlette.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from app.models.users import Users

from app.core.database import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Annotated, Literal
from fastapi import APIRouter, Request, Depends, HTTPException, Response, Form
from sqlmodel import select, desc


router = APIRouter()


class ExportOptionalParams(BaseModel):
    firstname: str = ""
    lastname: str = ""


async def generate_csvs(
	session: AsyncSession,
	optional_params: ExportOptionalParams,
	user: Users,
	target_out_path
):
    statement = (
        select(MedicationLogs)
        .where(MedicationLogs.user_id == user.id)
        .order_by(desc(MedicationLogs.id))
    )
    results = await session.exec(statement)
    med_logs = results.all()
    med_logs = [MedicationLogsWithTimestamp(**log.model_dump()) for log in med_logs]
    statement = (
        select(MoodLogs).where(MoodLogs.user_id == user.id).order_by(desc(MoodLogs.id))
    )
    results = await session.exec(statement)
    mood_logs = results.all()
    mood_logs = [MoodLogsWithTimestamp(**log.model_dump()) for log in mood_logs]

    med_logs_tmp = NamedTemporaryFile(
        dir=target_out_path, delete_on_close=True, suffix=".csv"
    )
    mood_logs_tmp = NamedTemporaryFile(
        dir=target_out_path, delete_on_close=True, suffix=".csv"
    )

    med_logs_df = pd.DataFrame([m.model_dump() for m in med_logs])
    mood_logs_df = pd.DataFrame([m.model_dump() for m in mood_logs])

    med_logs_df.to_csv(med_logs_tmp, index=False)
    mood_logs_df.to_csv(mood_logs_tmp, index=False)
    med_logs_ai_summary =ai_client(contents=["Summarize the following medication logs data. Use typst syntax instead of markdown and ensure it is supported for typst's eval with markup mode on. If data is empty, just send an empty text. The output must not contain any table.", med_logs_df.to_csv()]).text
    mood_logs_ai_summary =ai_client(contents=["Summarize the following mood logs data. Use typst syntax instead of markdown and ensure it is supported for typst's eval with markup mode on. If data is empty, just send an empty text. The output must not contain any tables.", mood_logs_df.to_csv()]).text
    print(med_logs_ai_summary, mood_logs_ai_summary)

    med_logs_tmp.flush()
    mood_logs_tmp.flush()

    return (med_logs_ai_summary, mood_logs_ai_summary, med_logs_tmp, mood_logs_tmp)

    
@router.post(path="/export/pdf", response_class=FileResponse)
async def export_pdf_file(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    optional_params: Annotated[ExportOptionalParams, Form()],
):
    if not is_logged_in:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)
    statement = select(Users).where(Users.email == claims.sub)
    results = await session.exec(statement)
    user = results.one_or_none()
    if user is None:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR)

    basepath = os.path.realpath(__file__)
    typst_path = os.path.join(basepath, "../../typst-templates/")
    med_logs_ai_summary, mood_logs_ai_summary, med_logs_tmp, mood_logs_tmp = await generate_csvs(session, optional_params, user, typst_path)

    main_typ = open(os.path.realpath(os.path.join(typst_path, "main.typ")), "rb")
    main_typ_b = main_typ.read()
    lib_typ = open(os.path.realpath(os.path.join(typst_path, "lib.typ")), "rb")
    lib_typ_b = lib_typ.read()
    files = {"main.typ": main_typ_b, "lib.typ": lib_typ_b}
    with NamedTemporaryFile(delete_on_close=True, suffix=".pdf") as fp:
        whom = f"{optional_params.firstname} {optional_params.lastname}"
        whom = whom.strip()
        whom_info = (
            f"{user.username} | {user.email} | {user.contact_number}"
            if user.username
            else f"{user.email} | {user.contact_number}"
        )
        whom = f"{whom} | {whom_info}" if whom.strip() != "" else whom_info
        print(fp.name, med_logs_tmp.name, mood_logs_tmp.name)
        csvfiles = [
            {"filepath": med_logs_tmp.name, "title": "Medication Logs History", "summary": med_logs_ai_summary},
            {"filepath": mood_logs_tmp.name, "title": "Mood Logs History", "summary": mood_logs_ai_summary},
        ]
        sys_inputs = {
            "whom": f"Pebble Recall Export: {whom}",
            "csvfiles": json.dumps(csvfiles),
        }
        typst.compile(
            files, root="/", format="pdf", output=fp.name, sys_inputs=sys_inputs
        )  # ty: ignore
        out = fp.read()

        main_typ.close()
        lib_typ.close()
        mood_logs_tmp.close()
        med_logs_tmp.close()

        headers = {"Content-Disposition": 'inline; filename="out.pdf"'}
        return Response(out, headers=headers, media_type="application/pdf")


@router.post(path="/export/csv/{kind}", response_class=FileResponse)
async def export_csv_file(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    kind: Literal["medications", "moods"],
):
    if not is_logged_in:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)
    statement = select(Users).where(Users.email == claims.sub)
    results = await session.exec(statement)
    user = results.one_or_none()
    if user is None:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR)
    if kind == "moods":
        statement = (
            select(MoodLogs)
            .where(MoodLogs.user_id == user.id)
            .order_by(desc(MoodLogs.id))
        )
        results = await session.exec(statement)
        mood_logs = results.all()
        mood_logs = [MoodLogsWithTimestamp(**log.model_dump()) for log in mood_logs]
        with NamedTemporaryFile(delete_on_close=True, suffix=".csv") as fp:
            mood_logs_df = pd.DataFrame([m.model_dump() for m in mood_logs])
            mood_logs_df.to_csv(fp.name, index=False)
            out = fp.read()

            headers = {"Content-Disposition": 'inline; filename="mood_logs.csv"'}
            return Response(out, headers=headers, media_type="text/csv")

    elif kind == "medications":
        statement = (
            select(MedicationLogs)
            .where(MedicationLogs.user_id == user.id)
            .order_by(desc(MedicationLogs.id))
        )
        results = await session.exec(statement)
        med_logs = results.all()
        med_logs = [MedicationLogsWithTimestamp(**log.model_dump()) for log in med_logs]
        with NamedTemporaryFile(delete_on_close=True, suffix=".csv") as fp:
            med_logs_df = pd.DataFrame([m.model_dump() for m in med_logs])
            med_logs_df.to_csv(fp.name, index=False)
            out = fp.read()

            headers = {"Content-Disposition": 'inline; filename="med_logs.csv"'}
            return Response(out, headers=headers, media_type="text/csv")
