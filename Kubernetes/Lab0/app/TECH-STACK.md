**Frontend**: React / Next.js  
**Api**: Python FastAPI  
**Load generator**: Go 1.23.4
**DB**: PostgreSQL
**Cache** / broker: Redis
**Worker**: Celery 
**Migrations**: Alembic
**ORM**: SQLAlchemy 2.x
**Object storage**: MinIO
**Auth**: JWT сначала, потом Keycloak/Authentik
**Observability**: Prometheus metrics + structured logs + OpenTelemetry


---

Backend:
  Python 3.12/3.13
  FastAPI
  Pydantic
  SQLAlchemy 2.x
  Alembic
  asyncpg
  Celery
  Redis
  PostgreSQL

Load generator:
  Go 1.23.4
  Standard library HTTP client
  Docker image: app-go-loader

Frontend:
  Next.js / React
  TypeScript
  TailwindCSS

Storage:
  MinIO

Dev:
  Docker Compose для локального запуска
  Helm chart для k8s
  Argo CD для GitOps

Observability:
  Prometheus
  Grafana
  Loki
  OpenTelemetry позже
