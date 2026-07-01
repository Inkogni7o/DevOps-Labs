## VictoriaMetrics

### Lab1: Metrics Stack

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

### Lab2: Logs And Metrics Integration

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