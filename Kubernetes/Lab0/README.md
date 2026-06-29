# Kubernetes Lab0

This lab contains the first Store Lab application scaffold.

## Local Container Run

Run everything through Docker Compose from `Kubernetes/Lab0/app`:

```sh
docker compose up --build
```

Run migrations separately when needed:

```sh
docker compose run --rm migrate
```

Seed a local admin and demo products:

```sh
docker compose run --rm seed
```

Default local admin:

- Email: `admin@example.com`
- Password: `admin-password-change-me`

Services:

- API: `http://localhost:8000`
- Web: `http://localhost:3000`
- Admin: `http://localhost:3001`
- Admin product management: `http://localhost:3001/products`
- MinIO console: `http://localhost:9001`

## Go Load Generator

The Go load generator lives in `app/go-loader` and builds the `app-go-loader` image.

It creates synthetic users and repeatedly places mock-paid orders for random available products. A single instance can be started as:

```sh
loader --users 10
```

Docker Compose keeps it behind the `load` profile so it does not run during normal development:

```sh
docker compose --profile load up --build go-loader
```

Useful settings:

- `--users` / `USERS`: number of simulated users in this loader instance.
- `--api-base-url` / `API_BASE_URL`: Store API URL. Compose uses `http://api:8000`.
- `--period` / `ORDER_PERIOD`: average order placement period per simulated user. Default: `1m`.
- `--min-delay` / `MIN_DELAY`: minimum random transaction start delay. Default: `5s`.
- `--max-delay` / `MAX_DELAY`: maximum random transaction start delay. Default: `15s`.
- `--max-products-per-order` / `MAX_PRODUCTS_PER_ORDER`: upper bound for randomly selected products per order.
- `--email-domain` / `USER_EMAIL_DOMAIN`: generated user email domain. Default: `load.example.com`.

For Kubernetes, the Helm chart includes an optional `goLoader` Deployment. It is disabled by default:

```yaml
goLoader:
  enabled: true
  replicas: 1
  users: 10
```

## Web App Flow

Open `http://localhost:3000`.

The customer UI supports:

- register or login;
- browse products;
- add products to cart;
- remove products from cart;
- create an order;
- pay for an order with the mock payment endpoint.

Run `docker compose run --rm seed` first if the catalog is empty.

## Kubernetes

The Helm chart lives in `deployments/helm/store-lab`.

The chart expects an existing Kubernetes Secret named `store-lab-secrets` with:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `S3_ENDPOINT`
- `GO_LOADER_USER_PASSWORD`
