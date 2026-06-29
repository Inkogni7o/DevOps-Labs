"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import {
  addCartItem,
  CartRead,
  createOrder,
  fetchCart,
  fetchOrders,
  fetchProducts,
  fetchProfile,
  loginUser,
  OrderRead,
  payOrder,
  PaymentRead,
  ProductRead,
  registerUser,
  removeCartItem,
  updateCartItem,
  UserRead,
} from "@/lib/api";

const tokenStorageKey = "store-lab-token";

type AuthMode = "login" | "register";
type StatusKind = "idle" | "success" | "error";

export function Storefront() {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [cart, setCart] = useState<CartRead>({ items: [], total_cents: 0 });
  const [orders, setOrders] = useState<OrderRead[]>([]);
  const [payment, setPayment] = useState<PaymentRead | null>(null);
  const [user, setUser] = useState<UserRead | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo-password");
  const [fullName, setFullName] = useState("Demo User");
  const [message, setMessage] = useState("Ready");
  const [statusKind, setStatusKind] = useState<StatusKind>("idle");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [visibleOrderCount, setVisibleOrderCount] = useState(5);

  const cartCount = useMemo(
    () => cart.items.reduce((total, item) => total + item.quantity, 0),
    [cart.items],
  );
  const visibleOrders = orders.slice(0, visibleOrderCount);
  const hasMoreOrders = orders.length > visibleOrderCount;
  const ordersListClassName =
    orders.length > 3 ? "mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto pr-1" : "mt-3 flex flex-col gap-3";

  useEffect(() => {
    refreshProducts();
    const savedToken = window.localStorage.getItem(tokenStorageKey);
    if (savedToken) {
      setToken(savedToken);
      hydrateSession(savedToken);
    }
  }, []);

  async function refreshProducts() {
    const nextProducts = await fetchProducts();
    setProducts(nextProducts);
    if (nextProducts.length === 0) {
      setStatus("Run the seed command if you expect demo products.", "idle");
    }
  }

  async function hydrateSession(nextToken: string) {
    try {
      const profile = await fetchProfile(nextToken);
      setUser(profile);
      const [nextCart, nextOrders] = await Promise.all([fetchCart(nextToken), fetchOrders(nextToken)]);
      setCart(nextCart);
      setOrders(nextOrders);
      setVisibleOrderCount(5);
      setStatus(`Signed in as ${profile.email}`, "success");
    } catch (error) {
      window.localStorage.removeItem(tokenStorageKey);
      setToken(null);
      setUser(null);
      setStatus(error instanceof Error ? error.message : "Session expired.", "error");
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runBusy("auth", async () => {
      setStatus(authMode === "login" ? "Logging in..." : "Creating account...", "idle");
      if (authMode === "register") {
        await registerUser({ email, password, full_name: fullName });
      }
      const response = await loginUser({ email, password });
      window.localStorage.setItem(tokenStorageKey, response.access_token);
      setToken(response.access_token);
      setUser(response.user);
      setStatus(`Signed in as ${response.user.email}`, "success");
      const [nextCart, nextOrders] = await Promise.all([
        fetchCart(response.access_token),
        fetchOrders(response.access_token),
      ]);
      setCart(nextCart);
      setOrders(nextOrders);
      setVisibleOrderCount(5);
    });
  }

  function logout() {
    window.localStorage.removeItem(tokenStorageKey);
    setToken(null);
    setUser(null);
    setCart({ items: [], total_cents: 0 });
    setOrders([]);
    setPayment(null);
    setVisibleOrderCount(5);
    setStatus("Signed out", "idle");
  }

  async function handleAddToCart(productId: number) {
    if (!token) {
      setStatus("Sign in before adding products to the cart.", "error");
      return;
    }
    await runBusy(`add-${productId}`, async () => {
      setStatus("Adding product to cart...", "idle");
      setCart(await addCartItem(token, productId));
      setStatus("Product added to cart.", "success");
    });
  }

  async function handleRemoveFromCart(productId: number) {
    if (!token) {
      return;
    }
    await runBusy(`remove-${productId}`, async () => {
      setStatus("Removing product from cart...", "idle");
      setCart(await removeCartItem(token, productId));
      setStatus("Product removed from cart.", "success");
    });
  }

  async function handleUpdateQuantity(productId: number, quantity: number) {
    if (!token) {
      return;
    }
    if (quantity < 1) {
      await handleRemoveFromCart(productId);
      return;
    }
    await runBusy(`quantity-${productId}`, async () => {
      setStatus("Updating quantity...", "idle");
      setCart(await updateCartItem(token, productId, quantity));
      setStatus("Quantity updated.", "success");
    });
  }

  async function handleCreateOrder() {
    if (!token) {
      setStatus("Sign in before creating an order.", "error");
      return;
    }
    await runBusy("create-order", async () => {
      setStatus("Creating order...", "idle");
      const order = await createOrder(token);
      setCart({ items: [], total_cents: 0 });
      setOrders([order, ...orders]);
      await refreshProducts();
      setStatus(`Order #${order.id} created.`, "success");
    });
  }

  async function handlePayOrder(orderId: number) {
    if (!token) {
      return;
    }
    await runBusy(`pay-${orderId}`, async () => {
      setStatus(`Paying order #${orderId}...`, "idle");
      const nextPayment = await payOrder(token, orderId);
      setPayment(nextPayment);
      setOrders(await fetchOrders(token));
      setStatus(`Payment #${nextPayment.id} completed.`, "success");
    });
  }

  async function runBusy(action: string, callback: () => Promise<void>) {
    setBusyAction(action);
    try {
      await callback();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.", "error");
    } finally {
      setBusyAction(null);
    }
  }

  function setStatus(nextMessage: string, nextStatusKind: StatusKind) {
    setMessage(nextMessage);
    setStatusKind(nextStatusKind);
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1fr_380px]">
      <section className="flex min-w-0 flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">Store Lab</p>
            <h1 className="mt-1 text-3xl font-semibold">Catalog</h1>
          </div>
          <div className="rounded border border-[var(--border)] bg-white px-3 py-2 text-sm">
            Cart: <span className="font-semibold">{cartCount}</span>
          </div>
        </header>
        <div className={statusClassName(statusKind)} role="status">
          {message}
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAuthenticated={Boolean(token)}
                isBusy={busyAction === `add-${product.id}`}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <p className="text-[var(--muted)]">No products are available yet.</p>
          )}
        </section>
      </section>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded border border-[var(--border)] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Account</h2>
            {user ? (
              <button className="text-sm font-semibold text-teal-800" type="button" onClick={logout}>
                Sign out
              </button>
            ) : null}
          </div>

          {user ? (
            <div className="mt-3 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--foreground)]">{user.full_name}</p>
              <p>{user.email}</p>
            </div>
          ) : (
            <form className="mt-4 flex flex-col gap-3" onSubmit={handleAuth}>
              <div className="grid grid-cols-2 rounded border border-[var(--border)] p-1">
                <button
                  className={authMode === "login" ? "rounded bg-teal-700 px-3 py-2 text-sm font-semibold text-white" : "rounded px-3 py-2 text-sm font-semibold"}
                  type="button"
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  className={authMode === "register" ? "rounded bg-teal-700 px-3 py-2 text-sm font-semibold text-white" : "rounded px-3 py-2 text-sm font-semibold"}
                  type="button"
                  onClick={() => setAuthMode("register")}
                >
                  Register
                </button>
              </div>
              {authMode === "register" ? (
                <label className="flex flex-col gap-1 text-sm">
                  Name
                  <input
                    className="h-10 rounded border border-[var(--border)] px-3"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </label>
              ) : null}
              <label className="flex flex-col gap-1 text-sm">
                Email
                <input
                  className="h-10 rounded border border-[var(--border)] px-3"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Password
                <input
                  className="h-10 rounded border border-[var(--border)] px-3"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <button
                className="h-10 rounded bg-[var(--accent)] px-3 font-semibold text-white disabled:opacity-60"
                disabled={busyAction === "auth"}
                type="submit"
              >
                {busyAction === "auth" ? "Working..." : authMode === "login" ? "Login" : "Register"}
              </button>
            </form>
          )}
        </section>

        <section className="rounded border border-[var(--border)] bg-white p-4">
          <h2 className="text-lg font-semibold">Cart</h2>
          <div className="mt-3 flex flex-col gap-3">
            {cart.items.length > 0 ? (
              cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.product_name}</p>
                    <p className="text-[var(--muted)]">
                      {item.quantity} x {formatPrice(item.unit_price_cents)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      className="h-8 w-8 rounded border border-[var(--border)] font-semibold disabled:opacity-60"
                      disabled={busyAction === `quantity-${item.product_id}`}
                      type="button"
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <input
                      className="h-8 w-14 rounded border border-[var(--border)] text-center"
                      min={1}
                      type="number"
                      value={item.quantity}
                      onChange={(event) =>
                        handleUpdateQuantity(item.product_id, Number(event.target.value))
                      }
                    />
                    <button
                      className="h-8 w-8 rounded border border-[var(--border)] font-semibold disabled:opacity-60"
                      disabled={busyAction === `quantity-${item.product_id}`}
                      type="button"
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="h-8 rounded border border-[var(--border)] px-2 font-semibold disabled:opacity-60"
                      disabled={busyAction === `remove-${item.product_id}`}
                      type="button"
                      onClick={() => handleRemoveFromCart(item.product_id)}
                    >
                      {busyAction === `remove-${item.product_id}` ? "..." : "Remove"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">Cart is empty.</p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatPrice(cart.total_cents)}</span>
          </div>
          <button
            className="mt-4 h-10 w-full rounded bg-[var(--accent)] px-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!token || cart.items.length === 0 || busyAction === "create-order"}
            type="button"
            onClick={handleCreateOrder}
          >
            {busyAction === "create-order" ? "Creating..." : "Create order"}
          </button>
        </section>

        <section className="rounded border border-[var(--border)] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Orders</h2>
            {orders.length > 0 ? (
              <span className="text-xs font-semibold text-[var(--muted)]">
                {Math.min(visibleOrderCount, orders.length)} / {orders.length}
              </span>
            ) : null}
          </div>
          <div className={ordersListClassName}>
            {orders.length > 0 ? (
              visibleOrders.map((order) => (
                <div key={order.id} className="rounded border border-[var(--border)] p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">#{order.id}</span>
                    <span>{order.status}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span>{formatPrice(order.total_cents)}</span>
                    <button
                      className="h-8 rounded bg-[var(--accent)] px-3 font-semibold text-white disabled:opacity-60"
                      disabled={order.status !== "pending_payment" || busyAction === `pay-${order.id}`}
                      type="button"
                      onClick={() => handlePayOrder(order.id)}
                    >
                      {busyAction === `pay-${order.id}` ? "Paying..." : "Pay"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No orders yet.</p>
            )}
            {orders.length > 5 && hasMoreOrders ? (
              <button
                className="h-9 rounded border border-[var(--border)] bg-white px-3 text-sm font-semibold"
                type="button"
                onClick={() => setVisibleOrderCount((currentCount) => currentCount + 5)}
              >
                Load more
              </button>
            ) : null}
          </div>
        </section>

        <section className="rounded border border-[var(--border)] bg-white p-4 text-sm">
          <h2 className="text-lg font-semibold">Status</h2>
          <p className="mt-2 text-[var(--muted)]">{message}</p>
          {payment ? (
            <p className="mt-2 text-[var(--muted)]">
              Last payment: {payment.status} / {formatPrice(payment.amount_cents)}
            </p>
          ) : null}
        </section>
      </aside>
    </main>
  );
}

function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

function statusClassName(statusKind: StatusKind): string {
  const baseClassName = "rounded border px-4 py-3 text-sm font-semibold";
  if (statusKind === "success") {
    return `${baseClassName} border-emerald-200 bg-emerald-50 text-emerald-800`;
  }
  if (statusKind === "error") {
    return `${baseClassName} border-red-200 bg-red-50 text-red-800`;
  }
  return `${baseClassName} border-[var(--border)] bg-white text-[var(--muted)]`;
}
