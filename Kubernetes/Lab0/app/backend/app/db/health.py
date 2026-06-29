from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def check_database(session: AsyncSession) -> None:
    await session.execute(text("SELECT 1"))


async def check_migrations(session: AsyncSession) -> None:
    await session.execute(text("SELECT version_num FROM alembic_version LIMIT 1"))

