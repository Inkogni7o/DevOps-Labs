# Lab 1: VictoriaMetrics Metrics Stack

This lab builds a single-node metrics observability stack around VictoriaMetrics. It is focused on collecting Prometheus-style metrics, storing them in VictoriaMetrics, visualizing them in Grafana, and evaluating alerts with vmalert and Alertmanager.

## What This Lab Uses

- **VictoriaMetrics single-node** as the time-series database for metrics storage and querying.
- **vmagent** as the Prometheus-compatible scraper that collects metrics and writes them to VictoriaMetrics through remote write.
- **vmalert** for alerting and recording rule evaluation.
- **Alertmanager** for receiving alert notifications from vmalert.
- **Grafana** for dashboards and metrics exploration.
- **node-exporter** for host-level system metrics.
- **dockmon** for Docker host/container monitoring.
- **nginx** as a reverse proxy in front of Grafana, VictoriaMetrics, vmalert, and Alertmanager.
- **Docker Compose** to run the full local lab environment.

The lab includes preconfigured Grafana provisioning files, VictoriaMetrics dashboards, vmagent and vmalert dashboards, node-exporter dashboards, alert dashboards, and alerting rules for VictoriaMetrics health, vmagent, and vmalert.

## What The Lab Does

The compose stack starts a complete metrics pipeline:

1. `vmagent` reads `deployment/docker/prometheus-vm-single.yml`.
2. `vmagent` scrapes VictoriaMetrics, vmagent, vmalert, node-exporter, and an example Windows exporter target.
3. `vmagent` writes scraped metrics to VictoriaMetrics.
4. Grafana loads the provisioned datasource and dashboards.
5. `vmalert` evaluates rules from `deployment/docker/rules`.
6. Alertmanager receives alert notifications from `vmalert`.
7. nginx exposes the main web interfaces through configured virtual hosts.

## How To Run

From this lab folder:

```bash
docker compose -f deployment/docker/compose-vm-single.yml up -d
```

To stop and remove the lab containers and volumes:

```bash
docker compose -f deployment/docker/compose-vm-single.yml down -v
```

Main local ports:

- Grafana: `http://localhost:3000`
- VictoriaMetrics: `http://localhost:8428`
- vmagent: `http://localhost:8429`
- vmalert: `http://localhost:8880`
- Alertmanager: `http://localhost:9093`
- node-exporter: `http://localhost:9100`
- dockmon: `https://localhost:8001`

## What You Learn

After completing this lab, you should understand:

- How a VictoriaMetrics single-node deployment stores and serves metrics.
- How vmagent replaces a Prometheus server for scraping and remote writing metrics.
- How Prometheus scrape configuration maps jobs to targets.
- How Grafana datasources and dashboards can be provisioned automatically.
- How vmalert evaluates alerting rules against VictoriaMetrics data.
- How Alertmanager fits into the alert delivery flow.
- How exporters expose infrastructure metrics for scraping.
- How a reverse proxy can route observability UIs behind friendly hostnames.

