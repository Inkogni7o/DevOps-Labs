from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.core.security import decode_access_token
from app.db.session import get_session
from app.modules.users.models import User

bearer_scheme = HTTPBearer(auto_error=False)
DatabaseSession = Annotated[AsyncSession, Depends(get_session)]


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: DatabaseSession,
) -> User:
    if credentials is None:
        raise ApiError("missing_token", "Authentication is required.", status_code=401)
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise ApiError("invalid_token", "The access token is missing a subject.", status_code=401)
    user = await session.scalar(select(User).where(User.id == int(user_id), User.is_active.is_(True)))
    if user is None:
        raise ApiError("user_not_found", "The authenticated user was not found.", status_code=401)
    return user


async def get_current_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if not current_user.is_admin:
        raise ApiError("admin_required", "Admin privileges are required.", status_code=403)
    return current_user

