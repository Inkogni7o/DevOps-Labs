# Lab1 Hints

These hints explain how to think about the starter manifests. They are not a finished solution.

Use these docs while filling the YAML:

- Pod docs: https://kubernetes.io/docs/concepts/workloads/pods/
- Service docs: https://kubernetes.io/docs/concepts/services-networking/service/
- Labels and selectors: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
- Namespaces: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/

## What Lab1 Is Really Testing

Lab1 is not testing a fully working shop. PostgreSQL, Redis, migrations, seed data, PVCs, ConfigMaps, Secrets, Deployments, and Jobs are later concerns.

Lab1 is testing whether you can translate the first container runtime shape from Docker Compose into Kubernetes:

- one frontend Pod;
- one backend API Pod;
- one Service that routes traffic to the frontend Pod;
- basic backend technical endpoints reachable for checks.

The full product catalog and login flow are expected to be incomplete or broken in Lab1.

## Reading Docker Compose

Open `../Lab0/app/docker-compose.yml` and focus only on the Compose services that represent the customer-facing frontend and backend API.

For each of those services, identify:

- what source directory or image is used;
- what command is run, if Compose overrides the image default command;
- which container port the process listens on;
- which environment variables are required for the container to start;
- whether the service depends on databases or queues that are not part of Lab1.

Important mental shift: Docker Compose can build images from `build.context`, but a Kubernetes Pod normally runs an already-built image. If a Compose service has `build.context`, you need to decide what image name exists in your local cluster or registry after you build it.

**No** PostgreSQL, Redis, MinIO, admin, worker, migrations, seed jobs, PVCs, ConfigMaps, or Secrets **are needed in this lab**.

## Pod Fields To Investigate

The Pod starter gives you:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name:
spec:
  containers:
  - name:
    image:
```

You need to decide what to add and why.

Useful Pod questions:

- What should the Pod be called inside the `lab1` namespace?
- What label should identify this Pod so a Service can find it?
- What should the container inside the Pod be called?
- What image should Kubernetes run?
- Does the container need an explicit command or can it use the image default?
- Does the container need environment variables to start?
- Which container port is useful to document for humans and Service mapping?

> Kubernetes labels are key-value metadata. A common beginner mistake is to add labels to a Pod, then use different selector values in the Service. The Service will exist, but it will have no endpoints.

You can think of the relationship like this:

```yaml
# Pod side: this object advertises labels.
metadata:
  labels:
    some-key: some-value

# Service side: this object searches for matching labels.
spec:
  selector:
    some-key: some-value
```

The key and value must match exactly. The exact words are your design choice, but they must be consistent.

## Service Fields To Investigate

The Service starter gives you:

```yaml
apiVersion: v1
kind: Service
metadata:
  name:
spec:
```

For Lab1, this Service is the frontend access point.

Useful Service questions:

- What should the Service be called?
- Which Pod labels should it select?
- What port should users connect to on the Service?
- What port does the frontend container actually listen on?
- Will you use a default `ClusterIP` Service with `kubectl port-forward`, or a different Service type supported by your local cluster?

Service port vocabulary:

- `port` is the port exposed by the Service.
- `targetPort` is the port on the selected Pod/container.
- `selector` is how the Service finds Pods.
- Endpoints appear only when the selector matches live Pods.

If `kubectl -n lab1 get endpoints <service-name>` shows no addresses, check the Pod labels and Service selector first.

## Health, Readiness, And Metrics In Lab1

The backend API has technical endpoints that are useful even before the full shop is working:

- `/healthz` should return HTTP 200 when the process is alive.
- `/metrics` should open and return a response.
- `/readyz` is expected to fail or report unready in Lab1 because it checks dependencies that are deliberately missing here.

That means a failing `/readyz` is not automatically a failed Lab1. In this lab, it proves that the endpoint exists and that the app correctly notices missing dependencies.

## Useful Commands

These commands help you debug the shape of your solution without giving you the answer:

```sh
kubectl -n lab1 get pods
kubectl -n lab1 describe pod <pod-name>
kubectl -n lab1 logs <pod-name>
kubectl -n lab1 get service
kubectl -n lab1 describe service <service-name>
kubectl -n lab1 get endpoints <service-name>
```

To test an internal Service from your laptop, use port-forwarding:

```sh
kubectl -n lab1 port-forward service/<service-name> <local-port>:<service-port>
```

To test the backend endpoints, port-forward to the API Pod or to a Service if you created one for your own debugging:

```sh
kubectl -n lab1 port-forward pod/<api-pod-name> <local-port>:<container-port>
curl http://127.0.0.1:<local-port>/healthz
curl http://127.0.0.1:<local-port>/readyz
curl http://127.0.0.1:<local-port>/metrics
```

## Common Lab1 Mistakes

- Using the `default` namespace instead of `lab1`.
- Expecting products or login to work without PostgreSQL and seed data.
- Creating a Service whose selector does not match the frontend Pod labels.
- Assuming `containerPort` exposes the app outside the cluster. It documents the container port; the Service or port-forward provides access.
- Copying every Compose service into Kubernetes. Lab1 is only frontend, backend API, and frontend access.
- Adding Deployments or PVCs too early. Those belong to later labs.

## Stop Before Solving Too Much

When you can show that the frontend Pod and backend API Pod are alive, the frontend Service has endpoints, `/healthz` returns 200, `/metrics` opens, and `/readyz` opens but fails/unready, stop.

That is the intended Lab1 boundary.
