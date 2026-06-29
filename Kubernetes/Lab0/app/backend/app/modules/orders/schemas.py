from pydantic import BaseModel


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    product_name: str
    unit_price_cents: int
    quantity: int
    line_total_cents: int


class OrderRead(BaseModel):
    id: int
    status: str
    total_cents: int
    items: list[OrderItemRead]

