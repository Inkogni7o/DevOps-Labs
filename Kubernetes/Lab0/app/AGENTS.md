# AGENTS.md

---

## Purpose

This file is the primary operating manual for AI agents working in this repository.

It should give the agent enough context to:

- understand what the project does;
- follow the correct architecture and established conventions;
- place code in the correct directories;
- run the required commands for setup, validation, and testing;
- avoid unsafe and low-quality changes;
- understand when to stop and ask a human.

If this file is vague, outdated, or contradictory, the agent's work quality will noticeably degrade. Keep it concrete.

---

## Project Snapshot

- Project name: `kubernetes-lab1`
- Project type: `web-app + api`
- One-line description: `Online store website + API`
- Business/domain context: `online store`
- Lifecycle stage: `MVP for later use in Kubernetes labs`
- Maintainers / owning team: `@thunboo`

---

## Agent Principles

Unless the user explicitly asks otherwise, the agent should:

- prefer the smallest safe change that solves the task;
- preserve the existing architecture and naming conventions;
- update tests when behavior changes;
- update docs, config, and examples if they become outdated because of changes;
- verify the result before finishing;
- avoid speculative refactoring;
- ask before destructive, irreversible, expensive, or production-affecting actions.

### Optimize For

1. Correctness
2. Maintainability
3. Speed

### What The Agent Must Not Do By Default

- Rewrite the architecture without being asked.
- Add a new dependency if the task can be solved with dependencies already present in the project.
- Manually edit generated files if the project has an established workflow for them.
- Ignore failing checks related to changed files or behavior.
- Guess in security-sensitive, billing-sensitive, or compliance-sensitive areas.

---

## Sources Of Truth

Before making any non-trivial changes, consult the following materials:

| Source | Path / URL | When To Use |
| --- | --- | --- |
| MVP requirements | `MVP-requirements.md` | `Use when you need to understand what should and should NOT be added to the project if the user's comments are not enough (STILL ASK THE USER if something is not explicitly marked in the referenced file)` |

If documentation and code contradict each other, `ask_human` has priority, and the discrepancy must be mentioned in the final summary.

---

## Tech Stack

Do not write "latest". Specify exact versions or supported ranges.

### Core Stack

- Language(s): `JavaScript, Python3`
- Runtime(s): `python3.14, etc`
- Framework(s): `React, Next.js, FastAPI`
- Database(s): `PostgreSQL 17`
- Messaging / queueing: `Python Celery`
- Cache / storage: `Redis`
- Hosting / infrastructure: `on-prem`

+ Contents of the `TECH-STACK.md` file

---

## Architecture

- Architecture style: `modular monolith`
- Main modules / bounded contexts: `users, orders, products, carts, payments, inventory, admin`

---

## Repository Structure

You work only in the `Kubernetes/Lab0/` directory.

### File Placement Rules

```md
app/web/          # customer-facing frontend
app/admin/        # internal operations frontend
app/backend/      # backend code
app/tests/        # folder containing tests (not necessary; do this only if the user asks)
docs/             # architecture notes, onboarding docs
```

---

## Environment Setup

### Required Tooling

```md
- Code will NOT be run directly on the machine, so everything must be set up only in Dockerfile for running in Docker and Kubernetes
- Where to load env variables from: .env.local # Fill it with test data yourself
```

## Code Style And Naming

* Formatter: `Prettier` for frontend, `Ruff Formatter` for backend
* Linter: `ESLint` for frontend, `Ruff` for backend
* Type policy: `strict`
* Comments policy: comments are used only where the code does not explain the intent by itself: complex business logic, non-trivial algorithms, important constraints, and reasons for workaround solutions. Obvious actions are not commented.
* Import policy: `absolute`, `grouped`, `sorted`
* Error handling approach: backend uses `exceptions` with centralized exception handlers and a unified API error format; frontend uses typed error wrappers for the API client and user-friendly error states in the UI.
* Logging approach: `structured` logging on the backend; on the frontend, log only technically significant errors without sensitive data.
* Configuration approach: `typed env schema`; all environment variables are described centrally, validated at application startup, and not read directly from `process.env` / `os.environ` inside business logic.

### Naming Conventions We Prefer

| Item | Preferred | Avoid | Example |
| --- | --- | --- | --- |
| Files | `kebab-case` for frontend files, `snake_case` for Python files | mixing styles, `file1`, `newFile`, `utils2` | `product-card.tsx`, `order_service.py` |
| Directories | `kebab-case` for frontend, `snake_case` for backend packages | `Common`, `misc`, `stuff`, `new-folder` | `product-catalog/`, `order_processing/` |
| Classes / components | `PascalCase` | `camelCase`, abstract names without meaning | `ProductCard`, `OrderService` |
| Functions / methods | `camelCase` in frontend, `snake_case` in backend | overly generic names: `handle`, `process`, `doStuff` | `fetchProducts`, `create_order` |
| Variables | `camelCase` in frontend, `snake_case` in backend | one-letter names outside short loops, unclear abbreviations | `selectedProductId`, `current_user` |
| Constants | `UPPER_SNAKE_CASE` for global constants; `camelCase` / `snake_case` for local immutable values | magic numbers and strings inside logic | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| Types / interfaces / schemas | `PascalCase`; backend schemas use `Request`, `Response`, `Create`, `Update`, `Read` suffixes | `IUser`, `TData`, `AnyObject` | `ProductResponse`, `CreateOrderRequest`, `UserRead` |
| Test names | behavior descriptions through `should...` / `test_...` | implementation-based tests instead of behavior-based tests | `shouldRenderProductPrice`, `test_create_order_returns_201` |
| Branch names | `<type>/<short-description>` | `fix`, `changes`, `my-branch`, `test123` | `feature/product-catalog`, `fix/order-validation` |

### Style Do / Don't

Do:

* use names that reflect intent;
* keep modules cohesive and focused;
* follow patterns that already exist near the code being changed;
* prefer explicit business logic over "clever" abstractions;
* separate the API layer, business logic, database access, and UI state;
* validate input at system boundaries: API requests, env config, forms;
* write tests for behavior, not internal implementation.

Don't:

* turn `utils` into a dumping ground for unrelated logic;
* mix multiple naming styles in one code area;
* hide important side effects behind vague helper names;
* introduce broad abstractions before a second real use case appears;
* read environment variables directly in different parts of the application;
* log passwords, tokens, cookies, personal data, or secret contents;
* use `any` / `dict` / `object` without necessity and without later validation.

---

## Security And Safety Boundaries

Treat this section as mandatory.

### Hard Rules

- Never commit secrets, private keys, access tokens, or production credentials.
- Never hardcode secrets in source code, tests, fixtures, or documentation.
- Redact sensitive values in logs and examples.
- Validate and sanitize untrusted input at the correct boundary.
- Use least privilege for database, cloud, and service credentials.
- Be especially careful in code related to auth, billing, PII, legal/compliance, infrastructure, or permissions.

### Confirmed Human Review Required Before These Actions

- deleting data or files;
- applying irreversible migrations;
- changing auth or permission logic;
- changing billing or payment flows;
- changing deployment or production infrastructure;
- installing or replacing major dependencies;
- rotating secrets or changing security configuration.

### Sensitive Areas

- Authentication / authorization
- Payments / billing
- Personal or regulated data
- Production configuration / infrastructure

---

### Definition Of Done

A change is not complete until:

1. relevant checks have passed;
2. tests have been added or updated where needed (for now, we do not use this item);
3. docs/config/examples have been updated if they are affected;
4. file placement and naming follow this document;
5. assumptions, risks, and follow-up work are documented.

---

## When The Agent Must Stop And Ask

The agent must stop and ask a human if:

- requirements are ambiguous and there are multiple valid implementations;
- a change may break API compatibility, data compatibility, or deployment safety;
- documentation and code materially contradict each other;
- tests fail for reasons unrelated to the task and the cause is unclear;
- the task requires secrets, production access, or product-policy decisions;
- the safest path depends on a tradeoff the user has not chosen yet.

---

## Maintenance Checklist For Humans

- Update this file when the architecture, stack, commands, or workflow changes.
- Make sure commands can be run exactly as written.
- Replace vague placeholders with real values before rollout.
- Add links to the best examples in the repository for common tasks.
- Split instructions into nested `AGENTS.md` files when one file becomes too broad in scope.
