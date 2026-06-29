from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import get_settings
from app.db.base import Base
from app.modules.admin.models import AdminAuditLog
from app.modules.carts.models import CartItem
from app.modules.inventory.models import InventoryReservation
from app.modules.orders.models import Order, OrderItem
from app.modules.payments.models import Payment
from app.modules.products.models import Product
from app.modules.users.models import User

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

_ = (
    AdminAuditLog,
    CartItem,
    InventoryReservation,
    Order,
    OrderItem,
    Payment,
    Product,
    User,
)


def run_migrations_offline() -> None:
    settings = get_settings()
    context.configure(
        url=str(settings.database_url),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    settings = get_settings()
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = str(settings.database_url).replace("+asyncpg", "+psycopg")
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
