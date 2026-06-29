from fastapi import APIRouter

from app.modules.admin.router import router as admin_router
from app.modules.carts.router import router as carts_router
from app.modules.health.router import router as health_router
from app.modules.inventory.router import router as inventory_router
from app.modules.orders.router import router as orders_router
from app.modules.payments.router import router as payments_router
from app.modules.products.router import router as products_router
from app.modules.users.router import router as users_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(users_router, prefix="/api/users", tags=["users"])
api_router.include_router(products_router, prefix="/api/products", tags=["products"])
api_router.include_router(carts_router, prefix="/api/cart", tags=["cart"])
api_router.include_router(orders_router, prefix="/api/orders", tags=["orders"])
api_router.include_router(payments_router, prefix="/api/payments", tags=["payments"])
api_router.include_router(inventory_router, prefix="/api/inventory", tags=["inventory"])
api_router.include_router(admin_router, prefix="/api/admin", tags=["admin"])

