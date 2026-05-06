from sqlalchemy.sql import text
import uuid
import datetime
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
    HTTP_500_INTERNAL_SERVER_ERROR, HTTP_400_BAD_REQUEST,
)
from app.models.users import Users

import matplotlib.pyplot as plt
from app.core.database import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Annotated, Literal
from fastapi import APIRouter, Request, Depends, HTTPException, Response, Form
from sqlmodel import select, desc
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

router = APIRouter()

def process_logs_to_typst(csv_path, start_date=None, end_date=None):
    # Load data
    df = pd.read_csv(csv_path)
    
    if df.empty:
        return "No data found for the selected range.", None, lambda: None

    def uuid7_to_datetime(uuid_str):
        """Extracts the 48-bit timestamp from UUIDv7 and converts to datetime."""
        try:
            # Explicitly use version=7; .time returns the timestamp in ms
            u = uuid.UUID(uuid_str, version=7)
            return pd.to_datetime(u.time / 1000, unit='s')
        except (ValueError, AttributeError):
            return pd.NaT

    # Generate the timestamp column from the UUIDv7 ID
    df['timestamp'] = df['id'].apply(uuid7_to_datetime)
    
    # Secondary filtering
    if start_date:
        df = df[df['timestamp'] >= pd.to_datetime(start_date)]
    if end_date:
        df = df[df['timestamp'] <= pd.to_datetime(end_date)]
        
    if df.empty:
        return "No data found for the selected range.", None, lambda: None

    # Sort for chronological plotting
    df = df.sort_values('timestamp')

    # Plotting
    fig = plt.figure(figsize=(10, 6))
    ax = plt.gca()
    
    # Check if mood columns exist before plotting (specific to mood_logs)
    if 'valence' in df.columns and 'arousal' in df.columns:
        plt.plot(df['timestamp'], df['valence'], label='Valence', color='#2ecc71', marker='o')
        plt.plot(df['timestamp'], df['arousal'], label='Arousal', color='#e74c3c', marker='s')
    
    # Adaptive X-Axis Formatting
    delta = df['timestamp'].max() - df['timestamp'].min()
    if delta.total_seconds() < 3600:
        fmt = mdates.DateFormatter('%H:%M:%S')
    elif delta.days < 2:
        fmt = mdates.DateFormatter('%b %d, %H:%M')
    else:
        fmt = mdates.DateFormatter('%Y-%m-%d')
        
    ax.xaxis.set_major_formatter(fmt)
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    
    plt.title(f"Trends ({df['timestamp'].min().date()} to {df['timestamp'].max().date()})")
    plt.legend()
    plt.grid(True, alpha=0.3)
    fig.autofmt_xdate()
    plt.subplots_adjust(bottom=0.25)

    # Save Plot
    tmp = NamedTemporaryFile(delete_on_close=False, suffix='.png')
    plot_path = tmp.name.replace('\\', '/')
    plt.savefig(plot_path, dpi=200)
    plt.close(fig)

    # Generate Typst Output
    typst_content = f"""
    = Analysis Report
    *Period:* {df['timestamp'].min().strftime('%c')} to {df['timestamp'].max().strftime('%c')}
    
    #figure(
      image("{plot_path}", width: 90%),
      caption: [Metric trends for the selected period.]
    )

    - *Total Logs:* {len(df)}
    """
    
    if 'valence' in df.columns:
        typst_content += f"\n    - *Average Valence:* {df['valence'].mean():.2f}"
        typst_content += f"\n    - *Average Arousal:* {df['arousal'].mean():.2f}"
    
    return typst_content, plot_path, tmp.close

class ExportOptionalParams(BaseModel):
    firstname: str = ""
    lastname: str = ""
    start_date: datetime.datetime | None = None
    end_date: datetime.datetime | None = None

def get_u7_bound(dt: datetime.datetime | None) -> str | None:
    """Helper to convert datetime to a sortable UUID string."""
    if dt is None:
        return None
    # Using your validated uuid8 approach for bit-level sorting compatibility
    return str(uuid.UUID(str(uuid.uuid8(a=int(dt.timestamp() * 1000))), version=7))

async def generate_csvs(
    session: AsyncSession,
    optional_params: ExportOptionalParams,
    user: Users,
    target_out_path,
    start_date: datetime.datetime | None = None,
    end_date: datetime.datetime | None = None   
):
    # --- 1. Validation ---
    if start_date and end_date and start_date >= end_date:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, 
            detail="start_date must be before end_date"
        )

    # Generate boundary IDs
    u7_start = get_u7_bound(start_date)
    u7_end = get_u7_bound(end_date)
    
    # Query parameters for bind variables
    params = {"u_id": user.id, "start": u7_start, "end": u7_end}

    def build_query(table_name: str) -> str:
        """Constructs a raw SQL string based on provided date filters."""
        # Using double quotes for table names is safer in Postgres if there are underscores
        query = f'SELECT * FROM "{table_name}" WHERE user_id = :u_id'
        if u7_start:
            query += " AND id >= :start"
        if u7_end:
            query += " AND id <= :end"
        query += " ORDER BY id DESC"
        return query

    # --- 2. Data Fetching (Raw SQL) ---
    # Medication Logs
    med_raw = await session.execute(text(build_query("medication_logs")), params)
    med_rows = med_raw.mappings().all()
    med_logs_df = pd.DataFrame(med_rows)

    # Mood Logs
    mood_raw = await session.execute(text(build_query("mood_logs")), params)
    mood_rows = mood_raw.mappings().all()
    mood_logs_df = pd.DataFrame(mood_rows)

    # --- 3. File Creation ---
    med_logs_tmp = NamedTemporaryFile(dir=target_out_path, delete_on_close=False, suffix=".csv")
    mood_logs_tmp = NamedTemporaryFile(dir=target_out_path, delete_on_close=False, suffix=".csv")

    med_logs_df.to_csv(med_logs_tmp.name, index=False)
    mood_logs_df.to_csv(mood_logs_tmp.name, index=False)

    # --- 4. AI Summarization ---
    med_csv_str = med_logs_df.to_csv(index=False) if not med_logs_df.empty else ""
    mood_csv_str = mood_logs_df.to_csv(index=False) if not mood_logs_df.empty else ""

    med_logs_ai_summary = ai_client(contents=[
        "Summarize the following medication logs data. Use typst syntax instead of markdown. "
        "Ensure it is supported for typst's eval with markup mode on. "
        "If data is empty, just send an empty text. The output must not contain any table.", 
        med_csv_str
    ]).text

    mood_logs_ai_summary = ai_client(contents=[
        "Summarize the following mood logs data. Use typst syntax instead of markdown. "
        "Ensure it is supported for typst's eval with markup mode on. "
        "If data is empty, just send an empty text. The output must not contain any tables.", 
        mood_csv_str
    ]).text

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
    typst_mood_plot_content, plot_path, plot_path_close_fn = process_logs_to_typst(mood_logs_tmp.name, start_date=optional_params.start_date, end_date=optional_params.end_date)

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
            {"filepath": mood_logs_tmp.name, "title": "Mood Logs History", "summary": f"{mood_logs_ai_summary}\n\n{typst_mood_plot_content}"},
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
        plot_path_close_fn()

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
