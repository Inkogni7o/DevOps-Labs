from pydantic import BaseModel


class PayOrderRequest(BaseModel):
    order_id: int


class RefundRequest(BaseModel):
    payment_id: int


class PaymentRead(BaseModel):
    id: int
    order_id: int
    status: str
    amount_cents: int
    provider_reference: str

    model_config = {"from_attributes": True}

