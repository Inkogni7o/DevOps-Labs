from pydantic import BaseModel, Field


class ReserveStockRequest(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)
    order_id: int | None = None


class ReservationRead(BaseModel):
    id: int
    product_id: int
    order_id: int | None
    quantity: int
    status: str

    model_config = {"from_attributes": True}

