# Lab 2: VictoriaLogs And Metrics Integration

This lab extends the VictoriaMetrics observability setup with VictoriaLogs. It is focused on collecting container logs, storing and querying them in VictoriaLogs, visualizing them in Grafana, and evaluating both metrics-based and logs-based alerts.

## What This Lab Uses

- **VictoriaLogs single-node** as the log storage and query engine.
- **Vector** as the log collector for Docker logs and demo Apache-style logs.
- **VictoriaMetrics single-node** for metrics storage, including internal metrics from Vector and VictoriaLogs-related monitoring.
- **vmauth** to route API requests between VictoriaMetrics and VictoriaLogs based on request paths.
- **vmalert** to evaluate metrics rules and VictoriaLogs rules.
- **Alertmanager** for receiving alert notifications from vmalert.
- **Grafana** with the VictoriaMetrics Logs datasource plugin and provisioned dashboards.
- **nginx** as a reverse proxy for the web interfaces in the combined stack.
- **Docker Compose** to run either a logs-focused stack or a combined metrics and logs stack.

The lab includes VictoriaLogs dashboards, Vector configuration, VictoriaLogs alert rules, example log alerts, datasource provisioning, and compose files for different deployment shapes.

## What The Lab Does

The logs-focused stack starts a pipeline where:

1. `vector` reads Docker container logs and generated demo logs.
2. `vector` parses JSON log messages when possible.
3. `vector` sends logs to VictoriaLogs through the Elasticsearch-compatible ingestion endpoint.
4. `vector` also exposes internal metrics and writes them to VictoriaMetrics.
5. Grafana uses the VictoriaMetrics Logs datasource plugin to query VictoriaLogs.
6. `vmauth` routes metrics API paths to VictoriaMetrics and VictoriaLogs select paths to VictoriaLogs.
7. `vmalert` evaluates both standard metrics rules and `type: vlogs` log rules.
8. Alertmanager receives alert notifications from vmalert.

The combined stack in `compose-vmvl-single.yml` brings metrics and logs into one lab environment, adding vmagent, node-exporter, and the metrics dashboards from the first lab pattern.

## How To Run

From this lab folder, run the VictoriaLogs-focused stack:

```bash
docker compose -f deployment/docker/compose-vl-single.yml up -d
```

To run the combined VictoriaMetrics and VictoriaLogs stack:

```bash
docker compose -f deployment/docker/compose-vmvl-single.yml up -d
```

To stop and remove containers and volumes, use the same compose file with `down -v`:

```bash
docker compose -f deployment/docker/compose-vl-single.yml down -v
```

Main local ports:

- Grafana: `http://localhost:3000`
- VictoriaMetrics: `http://localhost:8428`
- VictoriaLogs: `http://localhost:9428`
- vmauth: `http://localhost:8427`
- vmalert: `http://localhost:8880`
- Alertmanager: `http://localhost:9093`
- Vector API: `http://localhost:8686`

## What You Learn

After completing this lab, you should understand:

- How VictoriaLogs stores and queries application and container logs.
- How Vector collects Docker logs and forwards them to VictoriaLogs.
- How VictoriaLogs can ingest logs through an Elasticsearch-compatible endpoint.
- How log stream fields, timestamp fields, and message fields are mapped during ingestion.
- How Grafana can query logs through the VictoriaMetrics Logs datasource plugin.
- How vmauth can route requests to different VictoriaMetrics components by API path.
- How vmalert supports both metrics rules and VictoriaLogs rules.
- How to combine metrics and logs into one observability workflow.

