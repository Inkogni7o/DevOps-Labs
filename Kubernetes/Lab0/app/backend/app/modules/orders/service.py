from sqlalchemy import Row, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.modules.carts.models import CartItem
from app.modules.orders.models import Order, OrderItem
from app.modules.orders.schemas import OrderItemRead, OrderRead
from app.modules.products.models import Product

ORDER_PENDING_PAYMENT = "pending_payment"
ORDER_CANCELLED = "cancelled"


async def create_order(session: AsyncSession, user_id: int) -> OrderRead:
    rows = await session.execute(
        select(CartItem, Product)
        .join(Product, Product.id == CartItem.product_id)
        .where(CartItem.user_id == user_id)
        .order_by(CartItem.id)
    )
    cart_rows = rows.all()
    if not cart_rows:
        raise ApiError("cart_empty", "Cannot create an order from an empty cart.", 409)
    total_cents = sum(product.price_cents * cart_item.quantity for cart_item, product in cart_rows)
    order = Order(user_id=user_id, status=ORDER_PENDING_PAYMENT, total_cents=total_cents)
    session.add(order)
    await session.flush()
    for cart_item, product in cart_rows:
        if product.stock_quantity < cart_item.quantity:
            raise ApiError("insufficient_stock", f"Not enough stock for {product.name}.", 409)
        product.stock_quantity -= cart_item.quantity
        session.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                unit_price_cents=product.price_cents,
                quantity=cart_item.quantity,
            )
        )
    await session.execute(delete(CartItem).where(CartItem.user_id == user_id))
    await session.commit()
    return await get_order(session, user_id, order.id)


async def list_orders(session: AsyncSession, user_id: int) -> list[OrderRead]:
    result = await session.scalars(select(Order).where(Order.user_id == user_id).order_by(Order.id.desc()))
    return [await get_order(session, user_id, order.id) for order in result]


async def get_order(session: AsyncSession, user_id: int, order_id: int) -> OrderRead:
    order = await session.scalar(select(Order).where(Order.id == order_id, Order.user_id == user_id))
    if order is None:
        raise ApiError("order_not_found", "Order was not found.", 404)
    rows = await session.execute(select(OrderItem).where(OrderItem.order_id == order_id).order_by(OrderItem.id))
    return OrderRead(
        id=order.id,
        status=order.status,
        total_cents=order.total_cents,
        items=[_to_order_item(row) for row in rows.all()],
    )


async def cancel_order(session: AsyncSession, user_id: int, order_id: int) -> OrderRead:
    order = await session.scalar(select(Order).where(Order.id == order_id, Order.user_id == user_id))
    if order is None:
        raise ApiError("order_not_found", "Order was not found.", 404)
    if order.status != ORDER_PENDING_PAYMENT:
        raise ApiError("order_not_cancellable", "Only pending payment orders can be cancelled.", 409)
    order.status = ORDER_CANCELLED
    await session.commit()
    return await get_order(session, user_id, order_id)


def _to_order_item(row: Row[tuple[OrderItem]]) -> OrderItemRead:
    item = row.t[0]
    return OrderItemRead(
        id=item.id,
        product_id=item.product_id,
        product_name=item.product_name,
        unit_price_cents=item.unit_price_cents,
        quantity=item.quantity,
        line_total_cents=item.unit_price_cents * item.quantity,
    )

