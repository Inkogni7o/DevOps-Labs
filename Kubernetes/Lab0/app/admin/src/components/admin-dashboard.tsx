"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";

import { AdminSummaryRead, fetchAdminSummary, loginUser, UserRead } from "@/lib/api";

const adminTokenStorageKey = "store-lab-admin-token";

type StatusKind = "idle" | "success" | "error";

export function AdminDashboard() {
  const [summary, setSummary] = useState<AdminSummaryRead | null>(null);
  const [user, setUser] = useState<UserRead | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin-password-change-me");
  const [message, setMessage] = useState("Login with the seeded admin account.");
  const [statusKind, setStatusKind] = useState<StatusKind>("idle");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(adminTokenStorageKey);
    if (savedToken) {
      setToken(savedToken);
      refreshSummary(savedToken);
    }
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setStatus("Logging in...", "idle");
    try {
      const response = await loginUser({ email, password });
      if (!response.user.is_admin) {
        throw new Error("This account is not an admin.");
      }
      window.localStorage.setItem(adminTokenStorageKey, response.access_token);
      setToken(response.access_token);
      setUser(response.user);
      await refreshSummary(response.access_token);
      setStatus(`Signed in as ${response.user.email}`, "success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed.", "error");
    } finally {
      setIsBusy(false);
    }
  }

  async function refreshSummary(nextToken = token) {
    if (!nextToken) {
      return;
    }
    setIsBusy(true);
    try {
      const nextSummary = await fetchAdminSummary(nextToken);
      setSummary(nextSummary);
      setStatus("Dashboard refreshed.", "success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load dashboard.", "error");
    } finally {
      setIsBusy(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(adminTokenStorageKey);
    setToken(null);
    setUser(null);
    setSummary(null);
    setStatus("Signed out.", "idle");
  }

  function setStatus(nextMessage: string, nextStatusKind: StatusKind) {
    setMessage(nextMessage);
    setStatusKind(nextStatusKind);
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Store Lab</p>
          <h1 className="mt-2 text-3xl font-semibold">Operations</h1>
        </div>
        {token ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted)]">{user?.email ?? "admin session"}</span>
            <button
              className="h-9 rounded border border-[var(--border)] px-3 text-sm font-semibold"
              type="button"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </header>

      <div className={statusClassName(statusKind)} role="status">
        {message}
      </div>

      {!token ? (
        <form className="mt-6 max-w-md rounded border border-[var(--border)] bg-white p-4" onSubmit={handleLogin}>
          <h2 className="text-lg font-semibold">Admin login</h2>
          <label className="mt-4 flex flex-col gap-1 text-sm">
            Email
            <input
              className="h-10 rounded border border-[var(--border)] px-3"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="mt-3 flex flex-col gap-1 text-sm">
            Password
            <input
              className="h-10 rounded border border-[var(--border)] px-3"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            className="mt-4 h-10 w-full rounded bg-[var(--accent)] px-3 font-semibold text-white disabled:opacity-60"
            disabled={isBusy}
            type="submit"
          >
            {isBusy ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : (
        <section className="mt-6 flex flex-col gap-6">
          <div className="flex justify-end">
            <div className="flex gap-3">
              <Link
                className="inline-flex h-9 items-center rounded border border-[var(--border)] bg-white px-3 text-sm font-semibold"
                href="/products"
              >
                Manage products
              </Link>
              <button
                className="h-9 rounded bg-[var(--accent)] px-3 text-sm font-semibold text-white disabled:opacity-60"
                disabled={isBusy}
                type="button"
                onClick={() => refreshSummary()}
              >
                {isBusy ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Metric label="Users" value={summary?.users_count ?? 0} />
            <Metric label="Products" value={summary?.products_count ?? 0} />
            <Metric label="Orders" value={summary?.orders_count ?? 0} />
            <Metric label="Revenue" value={formatPrice(summary?.total_revenue_cents ?? 0)} />
            <Metric label="Failed jobs" value={summary?.failed_jobs_count ?? 0} />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Panel title="Order statuses">
              <div className="grid gap-2">
                {summary?.orders_by_status.length ? (
                  summary.orders_by_status.map((item) => (
                    <div key={item.status} className="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2 text-sm">
                      <span className="font-semibold">{item.status}</span>
                      <span>{item.count}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState label="No orders yet." />
                )}
              </div>
            </Panel>

            <Panel title="Registered users">
              <div className="max-h-80 overflow-y-auto">
                {summary?.recent_users.length ? (
                  summary.recent_users.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-[var(--border)] py-3 text-sm last:border-b-0">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{item.full_name}</p>
                        <p className="truncate text-[var(--muted)]">{item.email}</p>
                      </div>
                      <span className="text-[var(--muted)]">{item.is_admin ? "admin" : "user"}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState label="No users yet." />
                )}
              </div>
            </Panel>
          </section>

          <Panel title="Recent orders">
            <div className="max-h-96 overflow-y-auto">
              {summary?.recent_orders.length ? (
                summary.recent_orders.map((item) => (
                  <div key={item.id} className="grid gap-2 border-b border-[var(--border)] py-3 text-sm last:border-b-0 md:grid-cols-[80px_1fr_140px_120px]">
                    <span className="font-semibold">#{item.id}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{item.customer_name}</p>
                      <p className="truncate text-[var(--muted)]">{item.customer_email}</p>
                    </div>
                    <span>{item.status}</span>
                    <span className="font-semibold">{formatPrice(item.total_cents)}</span>
                  </div>
                ))
              ) : (
                <EmptyState label="No orders yet." />
              )}
            </div>
          </Panel>
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <article className="rounded border border-[var(--border)] bg-white p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function Panel({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className="rounded border border-[var(--border)] bg-white p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyState({ label }: Readonly<{ label: string }>) {
  return <p className="text-sm text-[var(--muted)]">{label}</p>;
}

function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

function statusClassName(statusKind: StatusKind): string {
  const baseClassName = "mt-6 rounded border px-4 py-3 text-sm font-semibold";
  if (statusKind === "success") {
    return `${baseClassName} border-emerald-200 bg-emerald-50 text-emerald-800`;
  }
  if (statusKind === "error") {
    return `${baseClassName} border-red-200 bg-red-50 text-red-800`;
  }
  return `${baseClassName} border-[var(--border)] bg-white text-[var(--muted)]`;
}
