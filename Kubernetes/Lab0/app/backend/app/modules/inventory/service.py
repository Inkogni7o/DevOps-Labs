from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.modules.inventory.models import InventoryReservation
from app.modules.inventory.schemas import ReserveStockRequest
from app.modules.products.models import Product

RESERVATION_ACTIVE = "active"
RESERVATION_RELEASED = "released"
RESERVATION_CONSUMED = "consumed"


async def reserve_stock(session: AsyncSession, request: ReserveStockRequest) -> InventoryReservation:
    product = await session.get(Product, request.product_id)
    if product is None or not product.is_active:
        raise ApiError("product_not_found", "Product was not found.", 404)
    if product.stock_quantity < request.quantity:
        raise ApiError("insufficient_stock", "Not enough stock is available.", 409)
    product.stock_quantity -= request.quantity
    reservation = InventoryReservation(
        product_id=product.id,
        order_id=request.order_id,
        quantity=request.quantity,
        status=RESERVATION_ACTIVE,
    )
    session.add(reservation)
    await session.commit()
    await session.refresh(reservation)
    return reservation


async def release_stock(session: AsyncSession, reservation_id: int) -> InventoryReservation:
    reservation = await session.get(InventoryReservation, reservation_id)
    if reservation is None:
        raise ApiError("reservation_not_found", "Inventory reservation was not found.", 404)
    if reservation.status != RESERVATION_ACTIVE:
        raise ApiError("reservation_not_releasable", "Only active reservations can be released.", 409)
    product = await session.get(Product, reservation.product_id)
    if product is not None:
        product.stock_quantity += reservation.quantity
    reservation.status = RESERVATION_RELEASED
    await session.commit()
    await session.refresh(reservation)
    return reservation


async def decrement_stock_after_payment(
    session: AsyncSession,
    reservation_id: int,
) -> InventoryReservation:
    reservation = await session.get(InventoryReservation, reservation_id)
    if reservation is None:
        raise ApiError("reservation_not_found", "Inventory reservation was not found.", 404)
    if reservation.status != RESERVATION_ACTIVE:
        raise ApiError("reservation_not_consumable", "Only active reservations can be consumed.", 409)
    reservation.status = RESERVATION_CONSUMED
    await session.commit()
    await session.refresh(reservation)
    return reservation

