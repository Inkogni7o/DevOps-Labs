from pydantic import BaseModel, Field


class CartItemRequest(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class CartItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    product_name: str
    unit_price_cents: int
    line_total_cents: int


class CartRead(BaseModel):
    items: list[CartItemRead]
    total_cents: int

