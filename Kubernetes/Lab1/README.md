# Kubernetes Lab1

This lab starts the migration of the Lab0 online store from Docker Compose to Kubernetes.

The goal is not to receive a finished Kubernetes deployment. The goal is to inspect the existing Compose stack, understand what each service needs, and manually build the first Kubernetes manifests.

## Source Application

Use the Lab0 application as the source system:

- Application directory: `../Lab0/app/`
- Docker Compose file: `../Lab0/app/docker-compose.yml`
- Lab0 runbook: `../Lab0/README.md`

Start by reading the Compose services and answering:

- Which components run long-lived processes?
- Which components only run one-time commands?
- Which components need to be reachable through the network?
- Which components need environment variables?
- Which components depend on PostgreSQL or Redis?
- Which components need persistent data?

## Lab Scope

For this lab, start only with regular Kubernetes Pods and Services.

Allowed in this step:

- `Pod`
- `Service`

Not part of this step:

- `Deployment`
- `ReplicaSet`
- `StatefulSet`
- `DaemonSet`
- `Job`
- `CronJob`
- `Ingress`
- `ConfigMap`
- `Secret`
- `PersistentVolume`
- `PersistentVolumeClaim`
- Helm
- Kustomize

Those resources will appear in later labs and they are intentionally skipped here.

## Starter Manifests

The starter manifests live in `manifests/`.

They are intentionally incomplete. Empty fields such as `name:` and `image:` are part of the exercise.

This lab provides starters only for:

- `web-pod.yaml`
- `api-pod.yaml`
- `web-access.yaml`

Do not add PostgreSQL, Redis, MinIO, worker, admin, loader, or migration manifests in Lab1.

Pod documentation: https://kubernetes.io/docs/concepts/workloads/pods/

Service documentation: https://kubernetes.io/docs/concepts/services-networking/service/

Hints are available in `hints/README.md`. Use them if you are not sure how to connect Docker Compose fields with Kubernetes Pod and Service fields.

## Pod Starter

Every Pod manifest starts from this shape:

```yaml
# Docs: https://kubernetes.io/docs/concepts/workloads/pods/
apiVersion: v1
kind: Pod
metadata:
  name:
spec:
  containers:
  - name:
    image:
```

Your task is to decide what each blank should become for the corresponding Lab0 service.

## Service Starter

Every Service manifest starts from this shape:

```yaml
# Docs: https://kubernetes.io/docs/concepts/services-networking/service/
apiVersion: v1
kind: Service
metadata:
  name:
spec:
```

Your task is to determine which Pods need Services and what fields are required to connect them.

## Suggested Work Order

1. Inspect `../Lab0/app/docker-compose.yml`.
2. Identify the frontend and backend API containers.
3. Complete the frontend and backend Pod starters.
4. Complete the frontend access Service starter.
5. Fill only the fields you can justify from Compose or from Kubernetes documentation.
6. Keep notes about anything that cannot be migrated cleanly with only Pods and Services.

## When Counts As Done

Lab1 counts as done when the student has migrated the first runtime shape of the application, not when the full shop works.

The expected result is:

- all Lab1 resources are created in the `lab1` namespace;
- a frontend Pod exists and is alive;
- a backend API Pod exists and is alive;
- a Service points to the frontend Pod and has endpoints;
- the frontend can be reached through Kubernetes networking;
- the backend `/healthz` endpoint returns HTTP 200;
- the backend `/metrics` endpoint opens and returns a response;
- the backend `/readyz` endpoint opens, but it is expected to fail or report unready because PostgreSQL, Redis, migrations, and persistent storage are outside this lab.

It is acceptable that the shop does not show products, users cannot complete a real flow, and the application is not fully ready. Lab1 validates container migration and basic Kubernetes networking only.

## Verification Script

A small verifier is provided in `tests/verify_lab1.py`.

It uses `kubectl` and `curl` to check the Lab1 completion criteria. By default, it expects:

- frontend Pod: `web`
- backend Pod: `api`
- frontend Service: `web`
- namespace: `lab1`

Run it after applying your completed Lab1 manifests:

```sh
python3 tests/verify_lab1.py
```

If you used different names:

```sh
python3 tests/verify_lab1.py \
  --namespace lab1 \
  --frontend-pod <your-frontend-pod> \
  --backend-pod <your-backend-pod> \
  --frontend-service <your-frontend-service>
```

The verifier intentionally does not check products, users, orders, PostgreSQL, Redis, PVCs, Deployments, or full application readiness.

## Completion Criteria

By the end of this lab, you should be able to explain:

- what a Pod represents in comparison with a Compose service;
- why a Pod alone does not provide stable service discovery;
- why a Service needs selectors and ports;
- which parts of the Lab0 Compose stack are awkward without later Kubernetes resources;
- why Pods alone are not enough for a resilient application.

Do not turn this lab into a finished production deployment. The incompleteness is intentional.
