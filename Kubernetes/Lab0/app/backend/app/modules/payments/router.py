from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies import DatabaseSession, get_current_user
from app.modules.payments.models import Payment
from app.modules.payments.schemas import PayOrderRequest, PaymentRead, RefundRequest
from app.modules.payments.service import get_payment_status, pay_order, refund_payment
from app.modules.users.models import User

router = APIRouter()


@router.post("/pay-order", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
async def pay(
    request: PayOrderRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Payment:
    return await pay_order(session, current_user.id, request.order_id)


@router.post("/refund-mock", response_model=PaymentRead)
async def refund(
    request: RefundRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Payment:
    return await refund_payment(session, current_user.id, request.payment_id)


@router.get("/{payment_id}", response_model=PaymentRead)
async def status(
    payment_id: int,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Payment:
    return await get_payment_status(session, current_user.id, payment_id)
