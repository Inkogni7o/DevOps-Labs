from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import DatabaseSession, get_current_admin
from app.modules.inventory.models import InventoryReservation
from app.modules.inventory.schemas import ReservationRead, ReserveStockRequest
from app.modules.inventory.service import decrement_stock_after_payment, release_stock, reserve_stock
from app.modules.users.models import User

router = APIRouter()


@router.post("/reserve-stock", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
async def reserve(
    request: ReserveStockRequest,
    session: DatabaseSession,
    _: Annotated[User, Depends(get_current_admin)],
) -> InventoryReservation:
    return await reserve_stock(session, request)


@router.post("/{reservation_id}/release", response_model=ReservationRead)
async def release(
    reservation_id: int,
    session: DatabaseSession,
    _: Annotated[User, Depends(get_current_admin)],
) -> InventoryReservation:
    return await release_stock(session, reservation_id)


@router.post("/{reservation_id}/decrement-after-payment", response_model=ReservationRead)
async def decrement_after_payment(
    reservation_id: int,
    session: DatabaseSession,
    _: Annotated[User, Depends(get_current_admin)],
) -> InventoryReservation:
    return await decrement_stock_after_payment(session, reservation_id)

