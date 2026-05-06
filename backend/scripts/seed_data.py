"""Script to generate seed data for users, medication_logs, and mood_logs tables."""

import asyncio
import json
import os
import random
import uuid
from datetime import datetime, timezone
from pathlib import Path

import asyncpg
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id
from faker import Faker

fake = Faker()

LOG_START = datetime(2025, 1, 1, tzinfo=timezone.utc)
LOG_END = datetime(2027, 1, 1, tzinfo=timezone.utc)
LOG_START_TS = int(LOG_START.timestamp() * 1000)
LOG_END_TS = int(LOG_END.timestamp() * 1000)

LOGS_PER_USER = 150

MEDICATION_NAMES = [
    "Sertraline", "Fluoxetine", "Escitalopram", "Venlafaxine", "Duloxetine",
    "Bupropion", "Mirtazapine", "Citalopram", "Paroxetine", "Amitriptyline",
    "Lorazepam", "Clonazepam", "Alprazolam", "Diazepam", "Buspirone",
    "Lithium Carbonate", "Lamotrigine", "Valproate", "Quetiapine", "Aripiprazole",
]

SIDE_EFFECTS = [
    "Nausea", "Headache", "Drowsiness", "Dry mouth", "Insomnia",
    "Weight gain", "Dizziness", "Fatigue", "Blurred vision", "Constipation",
    "Anxiety", "Tremor", "Sweating", "Decreased appetite", None,
]


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    kdf = Argon2id(
        salt=salt,
        length=32,
        iterations=1,
        lanes=4,
        memory_cost=64 * 1024,
        ad=None,
        secret=None,
    )
    return kdf.derive_phc_encoded(password.encode())


def make_uuid7_with_ts(ts_ms: int) -> uuid.UUID:
    return uuid.UUID(str(uuid.uuid8(a=ts_ms)), version=7)


def random_log_ts_ms() -> int:
    return random.randint(LOG_START_TS, LOG_END_TS)


async def generate_users(conn: asyncpg.Connection, count: int = 1000) -> tuple[list[int], list[dict]]:
    """Generate user records and return their IDs and credentials."""
    user_ids = []
    credentials = []
    for _ in range(count):
        username = fake.user_name()
        email = fake.unique.email()
        contact_number = fake.phone_number()
        password = fake.password(length=12, special_chars=True, digits=True,
                                 upper_case=True, lower_case=True)
        hashed = hash_password(password)
        role = random.choice(["patient", "professional"])
        disabled = random.choices([True, False], weights=[5, 95])[0]

        now = datetime.now(timezone.utc)

        row = await conn.fetchrow(
            """
            INSERT INTO users (role, username, email, contact_number, password, disabled, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
            """,
            [role], username, email, contact_number, hashed, disabled, now, now,
        )
        user_ids.append(row["id"])
        credentials.append({
            "id": row["id"],
            "email": email,
            "password": password,
            "role": role,
        })

    print(f"Inserted {len(user_ids)} users")
    return user_ids, credentials


async def generate_medication_logs(
    conn: asyncpg.Connection, user_ids: list[int], logs_per_user: int = 150,
):
    """Generate medication log records."""
    total = 0
    for user_id in user_ids:
        for _ in range(logs_per_user):
            medication_name = random.choice(MEDICATION_NAMES)
            medication_id = uuid.uuid7()
            side_effects = random.choice(SIDE_EFFECTS)
            log_id = make_uuid7_with_ts(random_log_ts_ms())

            await conn.execute(
                """
                INSERT INTO medication_logs (id, user_id, medication_name, medication_id, user_noted_side_effects)
                VALUES ($1, $2, $3, $4, $5)
                """,
                log_id, user_id, medication_name, medication_id, side_effects,
            )
            total += 1

    print(f"Inserted {total} medication_logs")


async def generate_mood_logs(
    conn: asyncpg.Connection, user_ids: list[int], logs_per_user: int = 150,
):
    """Generate mood log records using batched inserts."""
    batch_size = 5000
    batch = []
    total = 0
    for user_id in user_ids:
        for _ in range(logs_per_user):
            valence = round(random.uniform(-1.0, 1.0), 2)
            arousal = round(random.uniform(-1.0, 1.0), 2)
            log_id = make_uuid7_with_ts(random_log_ts_ms())

            batch.append((log_id, user_id, valence, arousal))
            total += 1

            if len(batch) >= batch_size:
                await conn.executemany(
                    """
                    INSERT INTO mood_logs (id, user_id, valence, arousal)
                    VALUES ($1, $2, $3, $4)
                    """,
                    batch,
                )
                batch.clear()
                print(f"  mood_logs: {total} inserted so far")

    if batch:
        await conn.executemany(
            """
            INSERT INTO mood_logs (id, user_id, valence, arousal)
            VALUES ($1, $2, $3, $4)
            """,
            batch,
        )

    print(f"Inserted {total} mood_logs")


async def main():
    pg_url = os.environ.get("PG_URL", "postgresql://postgres:verysecurepassword@localhost:5432/pebble")
    conn = await asyncpg.connect(pg_url)
    try:
        print("Clearing existing data...")
        await conn.execute("DELETE FROM mood_logs")
        await conn.execute("DELETE FROM medication_logs")
        await conn.execute("DELETE FROM users")

        print("Generating data...")
        user_ids, credentials = await generate_users(conn, count=1000)

        credentials_path = Path(__file__).parent / "seed_credentials.json"
        with open(credentials_path, "w") as f:
            json.dump(credentials, f, indent=2)
        print(f"Saved {len(credentials)} user credentials to {credentials_path}")

        await generate_medication_logs(conn, user_ids, logs_per_user=LOGS_PER_USER)
        await generate_mood_logs(conn, user_ids, logs_per_user=LOGS_PER_USER)
        print("Done!")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
