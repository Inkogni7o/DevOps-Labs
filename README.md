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
