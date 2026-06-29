# Store Lab Architecture

Store Lab is a modular monolith with a FastAPI backend, a customer-facing Next.js web app, an admin Next.js app, PostgreSQL as the source of truth, Redis for broker/cache use cases, and Celery workers for background work.

The backend is split into domain modules:

- `users`
- `products`
- `carts`
- `orders`
- `payments`
- `inventory`
- `admin`

The Kubernetes deployment keeps API and workers independently scalable. Database migrations run as a separate Job. Readiness checks verify PostgreSQL, Redis, and applied migrations before the API receives traffic.

