from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import DatabaseSession, get_current_user
from app.modules.carts.schemas import CartItemRequest, CartRead
from app.modules.carts.service import add_item, remove_item, update_quantity, view_cart
from app.modules.users.models import User

router = APIRouter()


@router.get("", response_model=CartRead)
async def get_cart(session: DatabaseSession, current_user: Annotated[User, Depends(get_current_user)]) -> CartRead:
    return await view_cart(session, current_user.id)


@router.post("/items", response_model=CartRead)
async def add_cart_item(
    request: CartItemRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> CartRead:
    return await add_item(session, current_user.id, request)


@router.patch("/items", response_model=CartRead)
async def update_cart_item(
    request: CartItemRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> CartRead:
    return await update_quantity(session, current_user.id, request)


@router.delete("/items/{product_id}", response_model=CartRead)
async def remove_cart_item(
    product_id: int,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> CartRead:
    return await remove_item(session, current_user.id, product_id)

