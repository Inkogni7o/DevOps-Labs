## Kubernetes Labs

### Lab0: Store Application

Path: `Kubernetes/Lab0`

Lab0 contains the Store Lab application that later Kubernetes labs migrate step by step.

Main components:

- FastAPI backend with modules for users, products, carts, orders, payments, inventory, admin, and health checks.
- Next.js customer-facing web app.
- Next.js admin app with product management and operational dashboard views.
- PostgreSQL database.
- Redis cache/broker.
- Celery worker.
- MinIO object storage.
- Go load generator image named `app-go-loader`.
- Docker Compose local runtime.
- Helm chart under `Kubernetes/Lab0/deployments/helm/store-lab`.

Run from `Kubernetes/Lab0/app`:

```sh
docker compose up --build
```

Useful local URLs:

- API: `http://localhost:8000`
- Web: `http://localhost:3000`
- Admin: `http://localhost:3001`
- Admin product management: `http://localhost:3001/products`
- MinIO console: `http://localhost:9001`

See `Kubernetes/Lab0/README.md` for the full runbook.

### Lab1: Docker Compose To Kubernetes Basics

Path: `Kubernetes/Lab1`

Lab1 starts the migration from the Lab0 Docker Compose application to Kubernetes. It is intentionally incomplete and educational: students fill in the first Pod and Service manifests themselves.

Scope:

- frontend Pod starter;
- backend API Pod starter;
- frontend access Service starter;
- `lab1` namespace convention;
- hints for labels, selectors, Pod fields, Service fields, and endpoint checks;
- verifier script in `tests/verify_lab1.py`.

Lab1 does not include PostgreSQL, Redis, MinIO, PVCs, ConfigMaps, Secrets, Deployments, Jobs, Helm, or a fully working shop. Those are later-lab topics.

See `Kubernetes/Lab1/README.md` and `Kubernetes/Lab1/hints/README.md`.