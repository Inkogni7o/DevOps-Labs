from sqlalchemy import Row, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.modules.carts.models import CartItem
from app.modules.carts.schemas import CartItemRead, CartItemRequest, CartRead
from app.modules.products.models import Product


async def _get_cart_item(session: AsyncSession, user_id: int, product_id: int) -> CartItem | None:
    return await session.scalar(
        select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id)
    )


async def add_item(session: AsyncSession, user_id: int, request: CartItemRequest) -> CartRead:
    product = await session.get(Product, request.product_id)
    if product is None or not product.is_active:
        raise ApiError("product_not_found", "Product was not found.", 404)
    if product.stock_quantity < request.quantity:
        raise ApiError("insufficient_stock", "Not enough stock is available.", 409)
    cart_item = await _get_cart_item(session, user_id, request.product_id)
    if cart_item is None:
        session.add(CartItem(user_id=user_id, product_id=request.product_id, quantity=request.quantity))
    else:
        cart_item.quantity += request.quantity
    await session.commit()
    return await view_cart(session, user_id)


async def update_quantity(session: AsyncSession, user_id: int, request: CartItemRequest) -> CartRead:
    cart_item = await _get_cart_item(session, user_id, request.product_id)
    if cart_item is None:
        raise ApiError("cart_item_not_found", "Cart item was not found.", 404)
    cart_item.quantity = request.quantity
    await session.commit()
    return await view_cart(session, user_id)


async def remove_item(session: AsyncSession, user_id: int, product_id: int) -> CartRead:
    await session.execute(
        delete(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id)
    )
    await session.commit()
    return await view_cart(session, user_id)


async def view_cart(session: AsyncSession, user_id: int) -> CartRead:
    rows = await session.execute(
        select(CartItem, Product)
        .join(Product, Product.id == CartItem.product_id)
        .where(CartItem.user_id == user_id)
        .order_by(CartItem.id)
    )
    items = [_to_cart_item(row) for row in rows.all()]
    return CartRead(items=items, total_cents=sum(item.line_total_cents for item in items))


def _to_cart_item(row: Row[tuple[CartItem, Product]]) -> CartItemRead:
    cart_item, product = row.t
    return CartItemRead(
        id=cart_item.id,
        product_id=product.id,
        quantity=cart_item.quantity,
        product_name=product.name,
        unit_price_cents=product.price_cents,
        line_total_cents=product.price_cents * cart_item.quantity,
    )

