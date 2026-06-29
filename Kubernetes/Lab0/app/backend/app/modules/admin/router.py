from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select

from app.api.dependencies import DatabaseSession, get_current_admin
from app.modules.admin.schemas import (
    AdminOrderRead,
    AdminOrderStatusRead,
    AdminSummaryRead,
    AdminUserRead,
    FailedJobRead,
)
from app.modules.orders.models import Order
from app.modules.payments.models import Payment
from app.modules.products.models import Product
from app.modules.users.models import User

router = APIRouter()


@router.get("/summary", response_model=AdminSummaryRead)
async def summary(
    session: DatabaseSession,
    _: Annotated[User, Depends(get_current_admin)],
) -> AdminSummaryRead:
    users_count = await session.scalar(select(func.count(User.id)))
    products_count = await session.scalar(select(func.count(Product.id)))
    orders_count = await session.scalar(select(func.count(Order.id)))
    total_revenue_cents = await session.scalar(
        select(func.coalesce(func.sum(Payment.amount_cents), 0)).where(Payment.status == "paid")
    )
    status_rows = await session.execute(
        select(Order.status, func.count(Order.id)).group_by(Order.status).order_by(Order.status)
    )
    user_rows = await session.scalars(select(User).order_by(User.id.desc()).limit(20))
    order_rows = await session.execute(
        select(Order, User)
        .join(User, User.id == Order.user_id)
        .order_by(Order.id.desc())
        .limit(20)
    )
    return AdminSummaryRead(
        users_count=users_count or 0,
        products_count=products_count or 0,
        orders_count=orders_count or 0,
        total_revenue_cents=total_revenue_cents or 0,
        failed_jobs_count=0,
        orders_by_status=[
            AdminOrderStatusRead(status=status, count=count)
            for status, count in status_rows.all()
        ],
        recent_users=[
            AdminUserRead(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                is_admin=user.is_admin,
                is_active=user.is_active,
            )
            for user in user_rows
        ],
        recent_orders=[
            AdminOrderRead(
                id=order.id,
                user_id=user.id,
                customer_email=user.email,
                customer_name=user.full_name,
                status=order.status,
                total_cents=order.total_cents,
            )
            for order, user in order_rows.all()
        ],
    )


@router.get("/failed-jobs", response_model=list[FailedJobRead])
async def failed_jobs(_: Annotated[User, Depends(get_current_admin)]) -> list[FailedJobRead]:
    return []
