from sqlalchemy.sql import text
import uuid
import datetime
import json
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

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from scipy import stats

from app.core.database import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Annotated, Literal
from fastapi import APIRouter, Request, Depends, HTTPException, Response, Form
from sqlmodel import select, desc

router = APIRouter()


def compute_linear_regression(df: pd.DataFrame, value_col: str) -> dict:
    """Compute linear regression of a value column against time."""
    if len(df) < 2:
        return {"slope": 0.0, "intercept": 0.0, "r_squared": 0.0, "trend": "insufficient data"}

    timestamps = df['timestamp'].astype(np.int64).values
    slope, intercept, r_value, p_value, std_err = stats.linregress(timestamps, df[value_col].values)
    r_squared = r_value ** 2

    if abs(slope) < 1e-10:
        trend = "stable"
    elif slope > 0:
        trend = "increasing"
    else:
        trend = "decreasing"

    return {"slope": slope, "intercept": intercept, "r_squared": r_squared, "trend": trend}


def analyze_mood_logs(df: pd.DataFrame) -> str:
    """Generate statistical analysis summary for mood logs in typst format."""
    if df.empty:
        return "No mood log data available."

    typst_parts = []

    typst_parts.append(f"- *Total Entries:* {len(df)}")
    typst_parts.append(f"- *Average Valence:* {df['valence'].mean():.3f}")
    typst_parts.append(f"- *Valence Std Dev:* {df['valence'].std():.3f}")
    typst_parts.append(f"- *Min Valence:* {df['valence'].min():.3f}")
    typst_parts.append(f"- *Max Valence:* {df['valence'].max():.3f}")
    typst_parts.append(f"- *Average Arousal:* {df['arousal'].mean():.3f}")
    typst_parts.append(f"- *Arousal Std Dev:* {df['arousal'].std():.3f}")
    typst_parts.append(f"- *Min Arousal:* {df['arousal'].min():.3f}")
    typst_parts.append(f"- *Max Arousal:* {df['arousal'].max():.3f}")

    if 'timestamp' in df.columns:
        ts_df = df.copy()
        ts_df['timestamp'] = pd.to_datetime(ts_df['timestamp'], errors='coerce')
        ts_df = ts_df.dropna(subset=['timestamp'])
        if len(ts_df) >= 2:
            valence_reg = compute_linear_regression(ts_df, 'valence')
            arousal_reg = compute_linear_regression(ts_df, 'arousal')

            typst_parts.append("")
            typst_parts.append("= Trend Analysis")
            typst_parts.append(f"- *Valence Trend:* {valence_reg['trend']} (R² = {valence_reg['r_squared']:.3f})")
            typst_parts.append(f"- *Arousal Trend:* {arousal_reg['trend']} (R² = {arousal_reg['r_squared']:.3f})")

            ts_int = ts_df['timestamp'].astype(np.int64).values
            valence_corr, _ = stats.pearsonr(ts_int, ts_df['valence'].values)
            arousal_corr, _ = stats.pearsonr(ts_int, ts_df['arousal'].values)
            typst_parts.append(f"- *Valence-Time Correlation:* {valence_corr:.3f}")
            typst_parts.append(f"- *Arousal-Time Correlation:* {arousal_corr:.3f}")

            va_corr, _ = stats.pearsonr(ts_df['valence'].values, ts_df['arousal'].values)
            typst_parts.append(f"- *Valence-Arousal Correlation:* {va_corr:.3f}")

    return "\n    ".join(typst_parts)


def analyze_medication_logs(df: pd.DataFrame) -> str:
    """Generate statistical analysis summary for medication logs in typst format."""
    if df.empty:
        return "No medication log data available."

    typst_parts = []

    typst_parts.append(f"- *Total Entries:* {len(df)}")

    if 'medication_name' in df.columns:
        med_counts = df['medication_name'].value_counts()
        typst_parts.append("")
        typst_parts.append("= Medication Frequency")
        for med, count in med_counts.head(10).items():
            typst_parts.append(f"- *{med}:* {count} entries ({count / len(df) * 100:.1f}%)")

    if 'user_noted_side_effects' in df.columns:
        side_effects = df['user_noted_side_effects'].dropna()
        if len(side_effects) > 0:
            se_counts = side_effects.value_counts()
            typst_parts.append("")
            typst_parts.append("= Reported Side Effects")
            typst_parts.append(f"- *Entries with side effects:* {len(side_effects)} ({len(side_effects) / len(df) * 100:.1f}%)")
            for se, count in se_counts.head(10).items():
                typst_parts.append(f"- *{se}:* {count} reports")

    if 'timestamp' in df.columns:
        ts_df = df.copy()
        ts_df['timestamp'] = pd.to_datetime(ts_df['timestamp'], errors='coerce')
        ts_df = ts_df.dropna(subset=['timestamp'])
        if not ts_df.empty:
            daily_counts = ts_df.set_index('timestamp').resample('D').size()
            avg_per_day = daily_counts[daily_counts > 0].mean()
            typst_parts.append("")
            typst_parts.append("= Temporal Patterns")
            typst_parts.append(f"- *Average logs per active day:* {avg_per_day:.2f}")

    return "\n    ".join(typst_parts)

def process_logs_to_typst(csv_path, start_date=None, end_date=None):
    df = pd.read_csv(csv_path)

    if df.empty:
        return "No data found for the selected range.", None, lambda: None

    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce', utc=True)
        df = df.dropna(subset=['timestamp'])

    if start_date:
        start_dt = pd.to_datetime(start_date, utc=True)
        df = df[df['timestamp'] >= start_dt]
    if end_date:
        end_dt = pd.to_datetime(end_date, utc=True)
        df = df[df['timestamp'] <= end_dt]

    if df.empty:
        return "No data found for the selected range.", None, lambda: None

    df = df.sort_values('timestamp')

    typst_content = f"""
    = Analysis Report
    *Period:* {df['timestamp'].min().strftime('%Y-%m-%dT%H:%M:%S')} to {df['timestamp'].max().strftime('%Y-%m-%dT%H:%M:%S')}

    - *Total Logs:* {len(df)}
    """

    plot_path = None
    plot_tmp_close = lambda: None

    if 'valence' in df.columns and 'arousal' in df.columns:
        typst_content += f"\n    - *Average Valence:* {df['valence'].mean():.2f}"
        typst_content += f"\n    - *Average Arousal:* {df['arousal'].mean():.2f}"
        typst_content += f"\n    - *Valence Std Dev:* {df['valence'].std():.2f}"
        typst_content += f"\n    - *Arousal Std Dev:* {df['arousal'].std():.2f}"

        fig = plt.figure(figsize=(10, 6))
        ax = plt.gca()
        ts_local = df['timestamp'].dt.tz_localize(None)
        plt.plot(ts_local, df['valence'], label='Valence', color='#2ecc71', marker='o', markersize=3, linewidth=1)
        plt.plot(ts_local, df['arousal'], label='Arousal', color='#e74c3c', marker='s', markersize=3, linewidth=1)

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

        tmp = NamedTemporaryFile(delete_on_close=False, suffix='.png')
        plot_path = tmp.name.replace('\\', '/')
        plt.savefig(plot_path, dpi=200)
        plt.close(fig)
        plot_tmp_close = tmp.close

        typst_content += f"""

    #figure(
      image("{plot_path}", width: 90%),
      caption: [Valence and Arousal trends over time.]
    )
    """

    return typst_content, plot_path, plot_tmp_close

class ExportOptionalParams(BaseModel):
    firstname: str = ""
    lastname: str = ""
    start_date: datetime.datetime | None = None
    end_date: datetime.datetime | None = None

def get_u7_bound(dt: datetime.datetime | None) -> str | None:
    """Helper to convert datetime to a sortable UUID string."""
    if dt is None:
        return None
    return str(uuid.UUID(str(uuid.uuid8(a=int(dt.timestamp() * 1000))), version=7))


def uuid7_to_datetime(uuid_val) -> datetime.datetime | None:
    """Extract timestamp from UUIDv7 and return a datetime object."""
    try:
        if isinstance(uuid_val, uuid.UUID):
            u = uuid_val
        else:
            u = uuid.UUID(str(uuid_val), version=7)
        return datetime.datetime.fromtimestamp(u.time / 1000, tz=datetime.UTC)
    except (ValueError, AttributeError, TypeError):
        return None


def add_timestamp_column(df: pd.DataFrame) -> pd.DataFrame:
    """Replace the UUIDv7 'id' column with a human-readable 'timestamp' column as ISO string."""
    if 'id' not in df.columns:
        print(f"[texport] Warning: 'id' column not found. Available columns: {list(df.columns)}")
        return df

    def extract_ts(val):
        try:
            if isinstance(val, uuid.UUID):
                return datetime.datetime.fromtimestamp(val.time / 1000, tz=datetime.UTC).strftime('%Y-%m-%dT%H:%M:%S')
            u = uuid.UUID(str(val), version=7)
            return datetime.datetime.fromtimestamp(u.time / 1000, tz=datetime.UTC).strftime('%Y-%m-%dT%H:%M:%S')
        except Exception as e:
            print(f"[texport] Failed to parse UUID: {val!r} ({type(val).__name__}) -> {e}")
            return ""

    df = df.copy()
    df['timestamp'] = df['id'].apply(extract_ts)
    df = df.drop(columns=['id'])
    cols = [c for c in df.columns if c != 'timestamp']
    df = df[['timestamp'] + cols]
    return df

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
        query = f'SELECT * FROM "{table_name}" WHERE user_id = :u_id'
        if u7_start:
            query += " AND id >= :start"
        if u7_end:
            query += " AND id <= :end"
        query += " ORDER BY id ASC"
        return query

    # --- 2. Data Fetching (Raw SQL) ---
    med_raw = await session.execute(text(build_query("medication_logs")), params)
    med_rows = med_raw.mappings().all()
    med_logs = [MedicationLogsWithTimestamp(**dict(row)) for row in med_rows]
    med_logs_df = pd.DataFrame([log.model_dump() for log in med_logs])

    mood_raw = await session.execute(text(build_query("mood_logs")), params)
    mood_rows = mood_raw.mappings().all()
    mood_logs = [MoodLogsWithTimestamp(**dict(row)) for row in mood_rows]
    mood_logs_df = pd.DataFrame([log.model_dump() for log in mood_logs])

    # --- 4. File Creation ---
    med_logs_tmp = NamedTemporaryFile(dir=target_out_path, delete_on_close=True, suffix=".csv")
    mood_logs_tmp = NamedTemporaryFile(dir=target_out_path, delete_on_close=True, suffix=".csv")

    med_logs_df = med_logs_df.drop(columns=['user_id', 'medication_id'], errors='ignore')
    mood_logs_df = mood_logs_df.drop(columns=['user_id'], errors='ignore')

    med_logs_df.to_csv(med_logs_tmp.name, index=False)
    mood_logs_df.to_csv(mood_logs_tmp.name, index=False)
    print(f"[texport] med_logs CSV: {med_logs_tmp.name}")
    print(f"[texport] mood_logs CSV: {mood_logs_tmp.name}")

    # --- 5. Statistical Analysis ---
    med_logs_summary = analyze_medication_logs(med_logs_df)
    mood_logs_summary = analyze_mood_logs(mood_logs_df)

    return (med_logs_summary, mood_logs_summary, med_logs_tmp, mood_logs_tmp)

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
    med_logs_summary, mood_logs_summary, med_logs_tmp, mood_logs_tmp = await generate_csvs(session, optional_params, user, typst_path)
    typst_mood_plot_content, plot_path, plot_tmp_close = process_logs_to_typst(mood_logs_tmp.name, start_date=optional_params.start_date, end_date=optional_params.end_date)

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
            {"filepath": med_logs_tmp.name, "title": "Medication Logs History", "summary": med_logs_summary},
            {"filepath": mood_logs_tmp.name, "title": "Mood Logs History", "summary": f"{mood_logs_summary}\n\n{typst_mood_plot_content}"},
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
        plot_tmp_close()

        headers = {"Content-Disposition": 'inline; filename="out.pdf"'}
        return Response(out, headers=headers, media_type="application/pdf")


@router.post(path="/export/csv/{kind}", response_class=FileResponse)
async def export_csv_file(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    claims: Annotated[Claims, Depends(check_encrypted_cookie_auth)],
    is_logged_in: Annotated[bool, Depends(check_if_logged_in)],
    kind: Literal["medications", "moods"],
    start_date: Annotated[datetime.datetime | None, Form()] = None,
    end_date: Annotated[datetime.datetime | None, Form()] = None,
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

    u7_start = get_u7_bound(start_date)
    u7_end = get_u7_bound(end_date)

    if kind == "moods":
        query = select(MoodLogs).where(MoodLogs.user_id == user.id)
        if u7_start:
            query = query.where(MoodLogs.id >= u7_start)
        if u7_end:
            query = query.where(MoodLogs.id <= u7_end)
        query = query.order_by(MoodLogs.id.asc())
        results = await session.exec(query)
        mood_logs = results.all()
        mood_logs_with_ts = [MoodLogsWithTimestamp(**log.model_dump()) for log in mood_logs]
        mood_logs_df = pd.DataFrame([log.model_dump() for log in mood_logs_with_ts])
        fp = NamedTemporaryFile(dir=typst_path, delete_on_close=True, suffix=".csv")
        mood_logs_df.to_csv(fp.name, index=False)
        out = fp.read()

        headers = {"Content-Disposition": 'inline; filename="mood_logs.csv"'}
        return Response(out, headers=headers, media_type="text/csv")

    elif kind == "medications":
        query = select(MedicationLogs).where(MedicationLogs.user_id == user.id)
        if u7_start:
            query = query.where(MedicationLogs.id >= u7_start)
        if u7_end:
            query = query.where(MedicationLogs.id <= u7_end)
        query = query.order_by(MedicationLogs.id.asc())
        results = await session.exec(query)
        med_logs = results.all()
        med_logs_with_ts = [MedicationLogsWithTimestamp(**log.model_dump()) for log in med_logs]
        med_logs_df = pd.DataFrame([log.model_dump() for log in med_logs_with_ts])
        fp = NamedTemporaryFile(dir=typst_path, delete_on_close=True, suffix=".csv")
        med_logs_df.to_csv(fp.name, index=False)
        out = fp.read()

        headers = {"Content-Disposition": 'inline; filename="mood_logs.csv"'}
        return Response(out, headers=headers, media_type="text/csv")

    elif kind == "medications":
        query = select(MedicationLogs).where(MedicationLogs.user_id == user.id)
        if u7_start:
            query = query.where(MedicationLogs.id >= u7_start)
        if u7_end:
            query = query.where(MedicationLogs.id <= u7_end)
        query = query.order_by(MedicationLogs.id.asc())
        results = await session.exec(query)
        med_logs = results.all()
        med_logs_df = pd.DataFrame([log.model_dump() for log in med_logs])
        med_logs_df = add_timestamp_column(med_logs_df)
        fp = NamedTemporaryFile(dir=typst_path, delete_on_close=False, suffix=".csv")
        med_logs_df.to_csv(fp.name, index=False)
        out = fp.read()

        headers = {"Content-Disposition": 'inline; filename="med_logs.csv"'}
        return Response(out, headers=headers, media_type="text/csv")
