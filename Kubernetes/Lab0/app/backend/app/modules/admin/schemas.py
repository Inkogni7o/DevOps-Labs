from pydantic import BaseModel


class AdminUserRead(BaseModel):
    id: int
    email: str
    full_name: str
    is_admin: bool
    is_active: bool


class AdminOrderStatusRead(BaseModel):
    status: str
    count: int


class AdminOrderRead(BaseModel):
    id: int
    user_id: int
    customer_email: str
    customer_name: str
    status: str
    total_cents: int


class AdminSummaryRead(BaseModel):
    users_count: int
    products_count: int
    orders_count: int
    total_revenue_cents: int
    failed_jobs_count: int
    orders_by_status: list[AdminOrderStatusRead]
    recent_users: list[AdminUserRead]
    recent_orders: list[AdminOrderRead]


class FailedJobRead(BaseModel):
    id: str
    queue: str
    reason: str
