#!/usr/bin/env python3
"""Verify the intentionally small completion contract for Kubernetes Lab1."""

from __future__ import annotations

import argparse
import json
import shutil
import socket
import subprocess
import sys
import time
from dataclasses import dataclass


@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Verify Lab1 Pods, frontend Service endpoints, and API technical endpoints.",
    )
    parser.add_argument("--namespace", default="lab1", help="Kubernetes namespace to check.")
    parser.add_argument("--frontend-pod", default="web", help="Frontend Pod name.")
    parser.add_argument("--backend-pod", default="api", help="Backend API Pod name.")
    parser.add_argument("--frontend-service", default="web", help="Frontend Service name.")
    parser.add_argument("--backend-container-port", type=int, default=8000, help="API container port.")
    parser.add_argument("--timeout", type=float, default=20.0, help="Seconds to wait for port-forward.")
    return parser.parse_args()


def run_command(args: list[str], timeout: float = 15.0) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        check=False,
        capture_output=True,
        text=True,
        timeout=timeout,
    )


def require_command(command: str) -> CheckResult:
    path = shutil.which(command)
    if path:
        return CheckResult(f"{command} is installed", True, path)
    return CheckResult(f"{command} is installed", False, f"{command} was not found in PATH")


def kubectl_json(args: list[str], namespace: str) -> tuple[dict, str | None]:
    command = ["kubectl", "-n", namespace, *args, "-o", "json"]
    result = run_command(command)
    if result.returncode != 0:
        return {}, result.stderr.strip() or result.stdout.strip()
    try:
        return json.loads(result.stdout), None
    except json.JSONDecodeError as exc:
        return {}, f"kubectl returned invalid JSON: {exc}"


def check_pod_alive(name: str, namespace: str) -> CheckResult:
    pod, error = kubectl_json(["get", "pod", name], namespace)
    if error:
        return CheckResult(f"Pod {name} is alive", False, error)

    phase = pod.get("status", {}).get("phase", "")
    container_statuses = pod.get("status", {}).get("containerStatuses", [])
    running_containers = [
        status.get("name", "")
        for status in container_statuses
        if status.get("state", {}).get("running")
    ]

    if phase == "Running" and running_containers:
        return CheckResult(
            f"Pod {name} is alive",
            True,
            f"phase={phase}, running_containers={','.join(running_containers)}",
        )

    return CheckResult(
        f"Pod {name} is alive",
        False,
        f"phase={phase or 'unknown'}, running_containers={running_containers or 'none'}",
    )


def check_service_endpoints(name: str, namespace: str) -> CheckResult:
    endpoints, error = kubectl_json(["get", "endpoints", name], namespace)
    if error:
        return CheckResult(f"Service {name} has endpoints", False, error)

    subsets = endpoints.get("subsets", [])
    addresses = []
    for subset in subsets:
        addresses.extend(address.get("ip", "") for address in subset.get("addresses", []))
        addresses.extend(address.get("hostname", "") for address in subset.get("addresses", []))

    addresses = [address for address in addresses if address]
    if addresses:
        return CheckResult(f"Service {name} has endpoints", True, ", ".join(addresses))

    return CheckResult(f"Service {name} has endpoints", False, "no endpoint addresses found")


def get_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def start_port_forward(namespace: str, pod_name: str, local_port: int, remote_port: int) -> subprocess.Popen[str]:
    return subprocess.Popen(
        [
            "kubectl",
            "-n",
            namespace,
            "port-forward",
            f"pod/{pod_name}",
            f"{local_port}:{remote_port}",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )


def curl(url: str, timeout: float = 5.0) -> tuple[int | None, str]:
    result = run_command(
        ["curl", "-sS", "-o", "-", "-w", "\n%{http_code}", url],
        timeout=timeout,
    )
    if result.returncode != 0:
        return None, result.stderr.strip() or result.stdout.strip()

    output = result.stdout
    if "\n" not in output:
        return None, f"unexpected curl output: {output!r}"

    body, status = output.rsplit("\n", 1)
    try:
        return int(status), body.strip()
    except ValueError:
        return None, f"unexpected HTTP status from curl: {status!r}"


def wait_for_port_forward(base_url: str, timeout: float) -> CheckResult:
    deadline = time.monotonic() + timeout
    last_detail = "port-forward did not respond"
    while time.monotonic() < deadline:
        status, body = curl(f"{base_url}/healthz", timeout=2.0)
        if status is not None:
            return CheckResult("API port-forward opens", True, f"/healthz returned HTTP {status}")
        last_detail = body
        time.sleep(0.5)
    return CheckResult("API port-forward opens", False, last_detail)


def check_healthz(base_url: str) -> CheckResult:
    status, body = curl(f"{base_url}/healthz")
    if status == 200:
        return CheckResult("/healthz returns HTTP 200", True, body or "ok")
    return CheckResult("/healthz returns HTTP 200", False, f"HTTP {status}, body={body}")


def check_metrics(base_url: str) -> CheckResult:
    status, body = curl(f"{base_url}/metrics")
    if status is not None and 200 <= status < 500 and body:
        return CheckResult("/metrics opens", True, f"HTTP {status}, {len(body)} bytes")
    return CheckResult("/metrics opens", False, f"HTTP {status}, body={body}")


def check_readyz(base_url: str) -> CheckResult:
    status, body = curl(f"{base_url}/readyz")
    if status is None:
        return CheckResult("/readyz opens and reports unready", False, body)
    if status >= 400:
        return CheckResult("/readyz opens and reports unready", True, f"HTTP {status}")
    return CheckResult(
        "/readyz opens and reports unready",
        False,
        f"expected an unready/error response in Lab1, got HTTP {status}, body={body}",
    )


def print_result(result: CheckResult) -> None:
    mark = "PASS" if result.passed else "FAIL"
    print(f"[{mark}] {result.name}: {result.detail}")


def main() -> int:
    args = parse_args()
    results: list[CheckResult] = []

    for command in ("kubectl", "curl"):
        result = require_command(command)
        results.append(result)
        print_result(result)
        if not result.passed:
            return 1

    static_checks = [
        check_pod_alive(args.frontend_pod, args.namespace),
        check_pod_alive(args.backend_pod, args.namespace),
        check_service_endpoints(args.frontend_service, args.namespace),
    ]
    for result in static_checks:
        results.append(result)
        print_result(result)

    if not all(result.passed for result in static_checks):
        return 1

    local_port = get_free_port()
    base_url = f"http://127.0.0.1:{local_port}"
    port_forward = start_port_forward(
        args.namespace,
        args.backend_pod,
        local_port,
        args.backend_container_port,
    )

    try:
        api_open = wait_for_port_forward(base_url, args.timeout)
        results.append(api_open)
        print_result(api_open)
        if not api_open.passed:
            return 1

        endpoint_checks = [
            check_healthz(base_url),
            check_readyz(base_url),
            check_metrics(base_url),
        ]
        for result in endpoint_checks:
            results.append(result)
            print_result(result)
    finally:
        port_forward.terminate()
        try:
            port_forward.wait(timeout=5.0)
        except subprocess.TimeoutExpired:
            port_forward.kill()

    if all(result.passed for result in results):
        print("Lab1 verification passed.")
        return 0

    print("Lab1 verification failed.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
