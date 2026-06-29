from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import DatabaseSession, get_current_user
from app.modules.users.models import User
from app.modules.users.schemas import LoginRequest, LogoutResponse, RegisterRequest, TokenResponse, UserRead
from app.modules.users.service import login_user, register_user

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, session: DatabaseSession) -> User:
    return await register_user(session, request)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, session: DatabaseSession) -> TokenResponse:
    return await login_user(session, request)


@router.post("/logout", response_model=LogoutResponse)
async def logout() -> LogoutResponse:
    return LogoutResponse(message="Logged out. Discard the client-side token.")


@router.get("/profile", response_model=UserRead)
async def profile(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user

