from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.users.models import User
from app.modules.users.schemas import LoginRequest, RegisterRequest, TokenResponse


async def register_user(session: AsyncSession, request: RegisterRequest) -> User:
    existing_user = await session.scalar(select(User).where(User.email == request.email))
    if existing_user is not None:
        raise ApiError("email_already_registered", "A user with this email already exists.", 409)
    user = User(
        email=str(request.email),
        password_hash=hash_password(request.password),
        full_name=request.full_name,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def login_user(session: AsyncSession, request: LoginRequest) -> TokenResponse:
    user = await session.scalar(select(User).where(User.email == request.email))
    if user is None or not verify_password(request.password, user.password_hash):
        raise ApiError("invalid_credentials", "Email or password is incorrect.", 401)
    if not user.is_active:
        raise ApiError("user_inactive", "This user account is inactive.", 403)
    token = create_access_token(str(user.id), {"is_admin": user.is_admin})
    return TokenResponse(access_token=token, user=user)

