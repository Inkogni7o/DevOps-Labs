# API-функционал магазина

## Минимальный набор API

### Users

* [ ] `register` — регистрация пользователя
* [ ] `login` — вход
* [ ] `logout` — выход
* [ ] `profile` — профиль пользователя

### Products

* [ ] `list` — список товаров
* [ ] `search` — поиск товаров
* [ ] `details` — детали товара
* [ ] `admin create/update/delete` — создание, обновление и удаление товаров админом

### Cart

* [ ] `add item` — добавить товар в корзину
* [ ] `remove item` — удалить товар из корзины
* [ ] `update quantity` — изменить количество товара
* [ ] `view cart` — посмотреть корзину

### Orders

* [ ] `create order` — создать заказ
* [ ] `list my orders` — список моих заказов
* [ ] `order details` — детали заказа
* [ ] `cancel order` — отменить заказ

### Payments

* [ ] `pay order` — оплатить заказ
* [ ] `payment status` — статус оплаты
* [ ] `refund mock` — моковый возврат платежа

### Inventory

* [ ] `reserve stock` — зарезервировать остатки
* [ ] `release stock` — освободить резерв
* [ ] `decrement stock after payment` — списать остатки после оплаты

### Admin

* [ ] `manage products` — управление товарами
* [ ] `manage orders` — управление заказами
* [ ] `see failed jobs` — просмотр упавших фоновых задач

# Что обязательно заложить для Kubernetes

Вот именно это сделает проект учебным для Kubernetes, а не просто “сайт в контейнере”.

## Health checks

* [ ] `/healthz` — приложение живо
* [ ] `/readyz` — приложение готово принимать трафик

В `/readyz` стоит проверять:

* [ ] подключение к PostgreSQL
* [ ] подключение к Redis
* [ ] что миграции применены

## Metrics

* [ ] `/metrics` — Prometheus metrics

## Graceful shutdown

* [ ] корректно завершать текущие запросы при `SIGTERM`
* [ ] не обрывать активные операции во время остановки pod

## Config via env

Конфигурацию передавать через переменные окружения:

* [ ] `DATABASE_URL`
* [ ] `REDIS_URL`
* [ ] `JWT_SECRET`
* [ ] `S3_ENDPOINT`

## Secrets

* [ ] пароли не хранить открытым текстом в `values.yaml`
* [ ] секреты выносить в Kubernetes Secrets или внешний secret manager

## Migrations as Job

* [ ] запускать миграции отдельным Kubernetes Job
* [ ] например: `alembic upgrade head`

## Workers separately scalable

* [ ] API и workers масштабировать отдельно
* [ ] `api replicas != worker replicas`

## Resource requests/limits

* [ ] задавать `requests` и `limits`
* [ ] ограничивать CPU и memory

## HPA

* [ ] autoscaling API по CPU/RPS
* [ ] autoscaling worker по queue length — позже

## Structured logs

* [ ] писать логи в JSON-формате
* [ ] не писать plain text logs в production-сценариях

## Tracing

* [ ] OpenTelemetry — позже

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

