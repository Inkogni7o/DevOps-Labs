# DevOps Labs

This repository contains hands-on DevOps labs for application runtime, Kubernetes migration, and observability.

The repository is organized as a set of independent lab tracks. Each lab has its own README with the exact runbook, scope, and completion criteria.

## Tracks

| Track | Path | Status | Focus |
| --- | --- | --- | --- |
| Kubernetes | `Kubernetes/` | active | Containerized store application, Docker Compose, Kubernetes migration exercises |
| VictoriaMetrics Observability | `Observability/VictoriaMetrics/` | active | Metrics, logs, dashboards, alerts, Docker Compose observability stacks |

## Repository Layout

```md
Kubernetes/
  Lab0/                # Store Lab application scaffold and Docker Compose runtime
  Lab1/                # First Kubernetes migration exercise with Pods and Services
  Lab2/                # Reserved for a later Kubernetes lab

Observability/
  VictoriaMetrics/
    Lab1/              # VictoriaMetrics metrics stack
    Lab2/              # VictoriaLogs + VictoriaMetrics integration stack
```

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

## Observability Labs

### VictoriaMetrics Lab1: Metrics Stack

Path: `Observability/VictoriaMetrics/Lab1`

This lab runs a local single-node metrics observability stack.

Main components:

- VictoriaMetrics single-node.
- vmagent for scraping and remote write.
- vmalert for alert and recording rule evaluation.
- Alertmanager.
- Grafana with provisioned datasources and dashboards.
- node-exporter and dockmon.
- nginx reverse proxy.

Run from `Observability/VictoriaMetrics/Lab1`:

```sh
docker compose -f deployment/docker/compose-vm-single.yml up -d
```

See `Observability/VictoriaMetrics/Lab1/README.md` for ports and details.

### VictoriaMetrics Lab2: Logs And Metrics Integration

Path: `Observability/VictoriaMetrics/Lab2`

This lab extends the metrics setup with VictoriaLogs and log collection.

Main components:

- VictoriaLogs single-node.
- Vector for Docker and demo log collection.
- VictoriaMetrics single-node for metrics.
- vmauth for routing between metrics and logs APIs.
- vmalert for metrics and log rules.
- Alertmanager.
- Grafana with VictoriaMetrics Logs datasource plugin and dashboards.
- nginx reverse proxy.

Run the logs-focused stack from `Observability/VictoriaMetrics/Lab2`:

```sh
docker compose -f deployment/docker/compose-vl-single.yml up -d
```

Run the combined metrics and logs stack:

```sh
docker compose -f deployment/docker/compose-vmvl-single.yml up -d
```

See `Observability/VictoriaMetrics/Lab2/README.md` for ports and details.

## Common Tooling

Most labs assume:

- Docker and Docker Compose.
- A local Kubernetes cluster for Kubernetes migration labs.
- `kubectl` for Kubernetes verification.
- Python3 for small lab verification scripts.

## Lab Conventions

- Each lab owns its own README.
- Kubernetes lab namespaces follow `labN`, for example `lab1`.
- Lab verification scripts live under each lab's `tests/` directory when present.
- Educational starter manifests may be intentionally incomplete.
- Detailed run commands belong in the lab README closest to the files they operate on.

## Quick Start

To run the application baseline:

```sh
cd Kubernetes/Lab0/app
docker compose up --build
```

To work on the first Kubernetes migration exercise:

```sh
cd Kubernetes/Lab1
python3 tests/verify_lab1.py --help
```

To run the first observability stack:

```sh
cd Observability/VictoriaMetrics/Lab1
docker compose -f deployment/docker/compose-vm-single.yml up -d
```
