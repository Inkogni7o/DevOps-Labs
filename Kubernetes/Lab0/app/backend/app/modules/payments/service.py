from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.modules.orders.models import Order
from app.modules.payments.models import Payment

PAYMENT_PAID = "paid"
PAYMENT_REFUNDED = "refunded"


async def pay_order(session: AsyncSession, user_id: int, order_id: int) -> Payment:
    order = await session.scalar(select(Order).where(Order.id == order_id, Order.user_id == user_id))
    if order is None:
        raise ApiError("order_not_found", "Order was not found.", 404)
    existing_payment = await session.scalar(
        select(Payment).where(Payment.order_id == order_id, Payment.status == PAYMENT_PAID)
    )
    if existing_payment is not None:
        return existing_payment
    payment = Payment(
        order_id=order.id,
        status=PAYMENT_PAID,
        amount_cents=order.total_cents,
        provider_reference=f"mock_{uuid4().hex}",
    )
    order.status = "paid"
    session.add(payment)
    await session.commit()
    await session.refresh(payment)
    return payment


async def get_payment_status(session: AsyncSession, user_id: int, payment_id: int) -> Payment:
    payment = await session.scalar(
        select(Payment)
        .join(Order, Order.id == Payment.order_id)
        .where(Payment.id == payment_id, Order.user_id == user_id)
    )
    if payment is None:
        raise ApiError("payment_not_found", "Payment was not found.", 404)
    return payment


async def refund_payment(session: AsyncSession, user_id: int, payment_id: int) -> Payment:
    payment = await get_payment_status(session, user_id, payment_id)
    if payment.status != PAYMENT_PAID:
        raise ApiError("payment_not_refundable", "Only paid payments can be refunded.", 409)
    payment.status = PAYMENT_REFUNDED
    order = await session.get(Order, payment.order_id)
    if order is not None:
        order.status = "refunded"
    await session.commit()
    await session.refresh(payment)
    return payment

