from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

engine = create_async_engine(settings.PG_URL, echo=True)


async def get_session():
    async with AsyncSession(engine) as session:
        yield session
