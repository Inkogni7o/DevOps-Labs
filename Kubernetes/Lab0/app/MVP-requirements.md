# Store API Functionality

## Minimum API Set

### Users

* [ ] `register` — user registration
* [ ] `login` — sign in
* [ ] `logout` — sign out
* [ ] `profile` — user profile

### Products

* [ ] `list` — product list
* [ ] `search` — product search
* [ ] `details` — product details
* [ ] `admin create/update/delete` — product creation, update, and deletion by an admin

### Cart

* [ ] `add item` — add a product to the cart
* [ ] `remove item` — remove a product from the cart
* [ ] `update quantity` — change product quantity
* [ ] `view cart` — view the cart

### Orders

* [ ] `create order` — create an order
* [ ] `list my orders` — list my orders
* [ ] `order details` — order details
* [ ] `cancel order` — cancel an order

### Payments

* [ ] `pay order` — pay for an order
* [ ] `payment status` — payment status
* [ ] `refund mock` — mock payment refund

### Inventory

* [ ] `reserve stock` — reserve stock
* [ ] `release stock` — release reserved stock
* [ ] `decrement stock after payment` — decrement stock after payment

### Admin

* [ ] `manage products` — product management
* [ ] `manage orders` — order management
* [ ] `see failed jobs` — view failed background jobs

# What Must Be Included For Kubernetes

This is exactly what makes the project educational for Kubernetes, rather than just "a website in a container".

## Health Checks

* [ ] `/healthz` — the application is alive
* [ ] `/readyz` — the application is ready to receive traffic

`/readyz` should check:

* [ ] PostgreSQL connection
* [ ] Redis connection
* [ ] migrations have been applied

## Metrics

* [ ] `/metrics` — Prometheus metrics

## Graceful Shutdown

* [ ] correctly finish current requests on `SIGTERM`
* [ ] do not interrupt active operations while the pod is stopping

## Config Via Env

Pass configuration through environment variables:

* [ ] `DATABASE_URL`
* [ ] `REDIS_URL`
* [ ] `JWT_SECRET`
* [ ] `S3_ENDPOINT`

## Secrets

* [ ] do not store passwords in plain text in `values.yaml`
* [ ] move secrets to Kubernetes Secrets or an external secret manager

## Migrations As Job

* [ ] run migrations as a separate Kubernetes Job
* [ ] for example: `alembic upgrade head`

## Workers Separately Scalable

* [ ] scale API and workers separately
* [ ] `api replicas != worker replicas`

## Resource Requests/Limits

* [ ] define `requests` and `limits`
* [ ] limit CPU and memory

## HPA

* [ ] autoscale API by CPU/RPS
* [ ] autoscale worker by queue length — later

## Structured Logs

* [ ] write logs in JSON format
* [ ] do not write plain text logs in production scenarios

## Tracing

* [ ] OpenTelemetry — later

# Best Practices

* [ ] **Typed API**
* [ ] **OpenAPI / generated clients**
* [ ] **Clear domain modules**
* [ ] **PostgreSQL as source of truth**
* [ ] **Redis for cache / queue / locks**
* [ ] **Background workers**
* [ ] **Idempotent operations**
* [ ] **Outbox pattern**
* [ ] **Migrations in CI/CD**
* [ ] **Structured JSON logs**
* [ ] **Metrics**
* [ ] **Tracing**
* [ ] **Health/readiness probes**
* [ ] **Graceful shutdown**
* [ ] **Container-first config**
* [ ] **Secrets outside repo**
* [ ] **Contract between frontend and backend**
