import asyncio

from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal, dispose_database
from app.modules.products.models import Product
from app.modules.users.models import User

DEMO_PRODUCTS = [
    {
        "sku": "chatgpt-subscription",
        "name": "ChatGPT Subscription",
        "description": "A demo subscription product for testing the store flow.",
        "price_cents": 9999,
        "stock_quantity": 777,
        "is_active": True,
    },
    {
        "sku": "kubernetes-lab-kit",
        "name": "Kubernetes Lab Kit",
        "description": "A practical bundle for experimenting with containers and deployments.",
        "price_cents": 4900,
        "stock_quantity": 42,
        "is_active": True,
    },
]


async def seed_database() -> None:
    settings = get_settings()
    async with SessionLocal() as session:
        admin = await session.scalar(select(User).where(User.email == settings.seed_admin_email))
        if admin is None:
            session.add(
                User(
                    email=settings.seed_admin_email,
                    password_hash=hash_password(settings.seed_admin_password),
                    full_name=settings.seed_admin_full_name,
                    is_admin=True,
                )
            )

        for product_data in DEMO_PRODUCTS:
            product = await session.scalar(select(Product).where(Product.sku == product_data["sku"]))
            if product is None:
                session.add(Product(**product_data))

        await session.commit()


async def main() -> None:
    try:
        await seed_database()
    finally:
        await dispose_database()


if __name__ == "__main__":
    asyncio.run(main())
