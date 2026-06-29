from fastapi import APIRouter, status
from redis.asyncio import Redis

from app.api.dependencies import DatabaseSession
from app.core.config import get_settings
from app.db.health import check_database, check_migrations

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/readyz", status_code=status.HTTP_200_OK)
async def readyz(session: DatabaseSession) -> dict[str, str]:
    settings = get_settings()
    await check_database(session)
    await check_migrations(session)
    redis_client = Redis.from_url(str(settings.redis_url), encoding="utf-8", decode_responses=True)
    try:
        await redis_client.ping()
    finally:
        await redis_client.aclose()
    return {"status": "ready"}

