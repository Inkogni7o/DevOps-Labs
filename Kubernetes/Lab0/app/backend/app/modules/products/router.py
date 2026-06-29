from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.api.dependencies import DatabaseSession, get_current_admin
from app.modules.products.models import Product
from app.modules.products.schemas import ProductCreate, ProductRead, ProductUpdate
from app.modules.products.service import (
    create_product,
    delete_product,
    get_product,
    list_products,
    search_products,
    update_product,
)
from app.modules.users.models import User

router = APIRouter()


@router.get("", response_model=list[ProductRead])
async def list_all(session: DatabaseSession) -> list[Product]:
    return await list_products(session)


@router.get("/search", response_model=list[ProductRead])
async def search(query: Annotated[str, Query(min_length=1)], session: DatabaseSession) -> list[Product]:
    return await search_products(session, query)


@router.get("/{product_id}", response_model=ProductRead)
async def details(product_id: int, session: DatabaseSession) -> Product:
    return await get_product(session, product_id)


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def admin_create(
    request: ProductCreate,
    session: DatabaseSession,
    _: Annotated[User, Depends(get_current_admin)],
) -> Product:
    return await create_product(session, request)


@router.patch("/{product_id}", response_model=ProductRead)
async def admin_update(
    product_id: int,
    request: ProductUpdate,
    session: DatabaseSession,
    _: Annotated[User, Depends(get_current_admin)],
) -> Product:
    return await update_product(session, product_id, request)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete(
    product_id: int,
    session: DatabaseSession,
    _: Annotated[User, Depends(get_current_admin)],
) -> Response:
    await delete_product(session, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

