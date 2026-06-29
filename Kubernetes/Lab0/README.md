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
