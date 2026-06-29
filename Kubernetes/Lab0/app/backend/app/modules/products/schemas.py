from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1)
    price_cents: int = Field(ge=0)
    stock_quantity: int = Field(ge=0)
    is_active: bool = True


class ProductUpdate(BaseModel):
    sku: str | None = Field(default=None, min_length=1, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, min_length=1)
    price_cents: int | None = Field(default=None, ge=0)
    stock_quantity: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductRead(BaseModel):
    id: int
    sku: str
    name: str
    description: str
    price_cents: int
    stock_quantity: int
    is_active: bool

    model_config = {"from_attributes": True}

