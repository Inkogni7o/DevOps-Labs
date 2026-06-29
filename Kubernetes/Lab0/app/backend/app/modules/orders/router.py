from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import DatabaseSession, get_current_user
from app.modules.orders.schemas import OrderRead
from app.modules.orders.service import cancel_order, create_order, get_order, list_orders
from app.modules.users.models import User

router = APIRouter()


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create(
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> OrderRead:
    return await create_order(session, current_user.id)


@router.get("", response_model=list[OrderRead])
async def list_my_orders(
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[OrderRead]:
    return await list_orders(session, current_user.id)


@router.get("/{order_id}", response_model=OrderRead)
async def details(
    order_id: int,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> OrderRead:
    return await get_order(session, current_user.id, order_id)


@router.post("/{order_id}/cancel", response_model=OrderRead)
async def cancel(
    order_id: int,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> OrderRead:
    return await cancel_order(session, current_user.id, order_id)

