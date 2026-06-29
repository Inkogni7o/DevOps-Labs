from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ApiError
from app.modules.products.models import Product
from app.modules.products.schemas import ProductCreate, ProductUpdate


async def list_products(session: AsyncSession) -> list[Product]:
    result = await session.scalars(select(Product).where(Product.is_active.is_(True)).order_by(Product.id))
    return list(result)


async def search_products(session: AsyncSession, query: str) -> list[Product]:
    pattern = f"%{query}%"
    result = await session.scalars(
        select(Product)
        .where(Product.is_active.is_(True))
        .where(or_(Product.name.ilike(pattern), Product.description.ilike(pattern), Product.sku.ilike(pattern)))
        .order_by(Product.id)
    )
    return list(result)


async def get_product(session: AsyncSession, product_id: int) -> Product:
    product = await session.get(Product, product_id)
    if product is None or not product.is_active:
        raise ApiError("product_not_found", "Product was not found.", 404)
    return product


async def create_product(session: AsyncSession, request: ProductCreate) -> Product:
    product = Product(**request.model_dump())
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


async def update_product(session: AsyncSession, product_id: int, request: ProductUpdate) -> Product:
    product = await session.get(Product, product_id)
    if product is None:
        raise ApiError("product_not_found", "Product was not found.", 404)
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    await session.commit()
    await session.refresh(product)
    return product


async def delete_product(session: AsyncSession, product_id: int) -> None:
    product = await session.get(Product, product_id)
    if product is None:
        raise ApiError("product_not_found", "Product was not found.", 404)
    product.is_active = False
    await session.commit()

