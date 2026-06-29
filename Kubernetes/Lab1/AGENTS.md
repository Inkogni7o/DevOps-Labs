# AGENTS.md

---

## Purpose

This file is the primary operating manual for AI agents working in `Kubernetes/Lab1/`.

This lab is intentionally educational. The agent must help prepare a guided Kubernetes migration exercise, not a finished production-ready Kubernetes deployment.

It should give the agent enough context to:

- understand that Lab1 teaches migration from Docker Compose (from Lab0) to Kubernetes;
- keep Kubernetes YAML intentionally incomplete;
- create documentation that guides the student without solving the whole lab;
- place files in the correct directories;
- avoid adding advanced Kubernetes resources before they are requested;
- understand when to stop and ask a human.

If this file is vague, outdated, or contradictory, the agent's work quality will noticeably degrade. Keep it concrete.

---

## Project Snapshot

- Project name: `kubernetes-lab1`
- Project type: `educational Kubernetes migration lab`
- One-line description: `A lab where students migrate the Lab0 Docker Compose shop application to Kubernetes`
- Business/domain context: `online store infrastructure training`
- Lifecycle stage: `learning scaffold`
- Maintainers / owning team: `@thunboo`

---

## Agent Principles

Unless the user explicitly asks otherwise, the agent should:

- prefer the smallest safe change that supports the lab goal;
- preserve the educational nature of the task;
- leave discovery work for the student;
- write documentation that explains the task boundaries without giving full answers;
- avoid complete Kubernetes manifests;
- update docs and examples if they become outdated because of changes;
- verify file placement and YAML syntax only when appropriate for intentionally partial manifests;
- ask before adding resources or abstractions beyond the current lab scope.

### Optimize For

1. Learning value
2. Clarity
3. Minimal scaffolding

### What The Agent Must Not Do By Default

- Do not create complete Kubernetes YAML manifests.
- Do not create Deployments, ReplicaSets, StatefulSets, DaemonSets, Jobs, CronJobs, Ingresses, ConfigMaps, Secrets, PersistentVolumes, PersistentVolumeClaims, Helm charts, or Kustomize overlays unless the user explicitly asks.
- Do not fully migrate the Docker Compose stack to Kubernetes.
- Do not fill container names, image names, ports, selectors, labels, environment variables, volumes, probes, or resource limits unless the user explicitly asks.
- Do not hide the intended student work behind automation.
- Do not add a new dependency or toolchain for this lab unless the user explicitly asks.
- Do not ignore the difference between a deliberately incomplete teaching scaffold and a broken production manifest.

---

## Sources Of Truth

Before making any non-trivial changes, consult the following materials:

| Source | Path / URL | When To Use |
| --- | --- | --- |
| Lab0 application | `../Lab0/app/` | Use to understand what services the student will eventually migrate from Docker Compose. |
| Lab0 README | `../Lab0/README.md` | Use to understand how the application is currently run locally. |
| Kubernetes Pod docs | `https://kubernetes.io/docs/concepts/workloads/pods/` | Link from Pod starter definitions. |
| Kubernetes Service docs | `https://kubernetes.io/docs/concepts/services-networking/service/` | Link from Service starter definitions. |

If documentation and code contradict each other, ask the user which direction to follow and mention the discrepancy in the final summary.

---

## Lab Scope

The lab must start with:

- regular Kubernetes `Pod` resources;
- regular Kubernetes `Service` resources;
- no ReplicaSets or Deployments;
- incomplete YAML starters that students must finish themselves.

The initial YAML snippets must be intentionally minimal.

### Namespace Convention

Each Kubernetes lab uses a namespace named after the lab number:

- Lab1 uses `lab1`.
- Lab2 uses `lab2`.
- In general, use `labN`, where `N` is the numeric lab order.

README files, verification scripts, and examples must use the matching `labN` namespace by default.

### Pod Starter Shape

Every Pod starter must begin with a link to the official Kubernetes Pod documentation and only include the very beginning of the definition:

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

### Service Starter Shape

Every Service starter must begin with a link to the official Kubernetes Service documentation and only include the very beginning of the definition:

```yaml
# Docs: https://kubernetes.io/docs/concepts/services-networking/service/
apiVersion: v1
kind: Service
metadata:
  name:
spec:
```

Do not add the remaining Service fields unless the user explicitly asks.

---

## Tech Stack

Do not write "latest". Specify exact versions or supported ranges when versions are needed.

### Core Stack

- Application source: `../Lab0/app/`
- Original local runtime: `Docker Compose`
- Target learning platform: `Kubernetes`
- Initial Kubernetes resources allowed by default: `Pod`, `Service`
- Kubernetes API group for starters: `apiVersion: v1`
- Documentation language: `English`, unless the user explicitly asks for another language.

---

## Repository Structure

You work only in the `Kubernetes/Lab1/` directory unless the user explicitly asks to inspect another lab.

### File Placement Rules

```md
README.md          # main lab instructions for students
AGENTS.md          # agent rules for this lab
manifests/         # intentionally incomplete Kubernetes YAML starters, if requested
hints/             # guided explanations that help students complete the starters without giving full answers
tests/             # lightweight lab verification scripts
docs/              # optional extra lab notes, if requested
```

Do not copy the whole Lab0 application into Lab1 unless the user explicitly asks.

---

## Documentation Style

The lab README should:

- explain that the student is migrating the Lab0 Docker Compose application to Kubernetes;
- point students to Lab0 as the source application;
- describe the expected learning path;
- contain a section defining when the lab counts as done;
- provide only starter YAML fragments for Pods and Services;
- include official Kubernetes documentation links near the relevant starter definitions;
- link to hints when the lab includes beginner-oriented explanations;
- document how to run the lab verification script, if one exists;
- avoid complete answers, final manifests, or copy-paste-ready full deployments;
- keep tasks concrete enough that the student knows what to investigate next.

The README should not:

- include complete YAML for all application components;
- include a finished architecture diagram;
- include commands that assume a fully completed solution;
- include Helm, Kustomize, or Deployment-based workflows unless the user requests a later lab step.

---

## Verification Scripts

Each lab should include a small verification script when the lab has a concrete completion contract.

For Lab1, the verifier should check only the lab scope:

- expected Pods are alive;
- the frontend Service has endpoints;
- the frontend can be reached through Kubernetes networking when the student exposes it;
- backend `/healthz` returns HTTP 200;
- backend `/metrics` opens and returns a response;
- backend `/readyz` opens but is expected to fail or report unready because PostgreSQL, Redis, migrations, and persistent storage are outside Lab1.

Verification scripts must:

- live under `tests/`;
- use the matching `labN` namespace by default;
- use standard tools such as `kubectl`, `curl`, and the language standard library where possible;
- validate the educational completion criteria, not a production-ready application;
- avoid checking products, users, orders, PostgreSQL, Redis, PVCs, Deployments, or full application readiness in Lab1.

---

## Code And YAML Style

* YAML files must use two-space indentation.
* Resource starters must keep intentionally empty values blank, for example `name:` and `image:`.
* Comments should be short and educational.
* Avoid noisy comments that tell the student every exact field to add.
* Prefer official Kubernetes terminology.
* Use lowercase kebab-case file names for manifest files if any are created.

### Naming Conventions We Prefer

| Item | Preferred | Avoid | Example |
| --- | --- | --- | --- |
| Documentation files | `UPPERCASE.md` for root docs, kebab-case for nested docs | mixed naming styles | `README.md`, `pod-basics.md` |
| YAML files | `kebab-case.yaml` | `file1.yaml`, `newYaml.yml` | `api-pod.yaml` |
| Directories | `kebab-case` | `NewFolder`, `misc`, `stuff` | `manifests/` |
| Kubernetes starter names | blank by default | prefilled full answers | `name:` |

---

## Security And Safety Boundaries

Treat this section as mandatory.

### Hard Rules

- Never commit secrets, private keys, access tokens, or production credentials.
- Never hardcode real credentials in examples.
- Use placeholder values only when the user explicitly asks for examples.
- Do not include real database passwords, JWT secrets, access keys, or admin passwords from Lab0.
- Do not create Kubernetes `Secret` manifests by default.
- Do not add production infrastructure instructions by default.

### Confirmed Human Review Required Before These Actions

- adding complete Kubernetes manifests;
- adding Deployment, ReplicaSet, StatefulSet, Job, Ingress, ConfigMap, Secret, PVC, Helm, or Kustomize resources;
- changing Lab0 source files;
- adding commands that apply resources to a real cluster;
- deleting files;
- introducing external dependencies or tooling.

### Sensitive Areas

- Secrets and credentials
- Kubernetes cluster access
- Persistent storage
- Network exposure
- Production-like deployment instructions

---

## Definition Of Done

A change is not complete until:

1. the lab still teaches migration from Docker Compose to Kubernetes;
2. Kubernetes YAML remains intentionally incomplete unless the user explicitly requested otherwise;
3. only allowed resource types are introduced by default;
4. official documentation links are present near Pod and Service starter definitions;
5. README.md defines when the lab counts as done;
6. README.md and verification scripts use the matching `labN` namespace by default;
7. a lightweight verification script exists when the lab has concrete completion criteria;
8. docs/config/examples have been updated if they are affected;
9. file placement and naming follow this document;
10. assumptions, risks, and follow-up work are documented.

---

## When The Agent Must Stop And Ask

The agent must stop and ask a human if:

- the user request would turn the lab into a complete Kubernetes solution;
- the user request requires resources outside `Pod` and `Service`;
- requirements are ambiguous and there are multiple valid teaching approaches;
- documentation and code materially contradict each other;
- the task requires secrets, production cluster access, or real infrastructure changes;
- the safest path depends on a tradeoff the user has not chosen yet.

---

## Maintenance Checklist For Humans

- Update this file when the lab scope changes.
- Keep starter YAML incomplete until the lab intentionally advances to the next Kubernetes concept.
- Replace vague placeholders with clearer teaching prompts when students get stuck.
- Add nested `AGENTS.md` files only if Lab1 grows into multiple independent exercises.
