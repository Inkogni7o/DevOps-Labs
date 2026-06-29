"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import {
  createProduct,
  deleteProduct,
  fetchProducts,
  loginUser,
  ProductCreate,
  ProductRead,
  updateProduct,
  UserRead,
} from "@/lib/api";

const adminTokenStorageKey = "store-lab-admin-token";

type StatusKind = "idle" | "success" | "error";
type ProductFormState = ProductCreate;

const emptyProductForm: ProductFormState = {
  sku: "",
  name: "",
  description: "",
  price_cents: 0,
  stock_quantity: 0,
  is_active: true,
};

export function ProductManager() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserRead | null>(null);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin-password-change-me");
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [newProduct, setNewProduct] = useState<ProductFormState>(emptyProductForm);
  const [drafts, setDrafts] = useState<Record<number, ProductFormState>>({});
  const [message, setMessage] = useState("Login with an admin account to manage products.");
  const [statusKind, setStatusKind] = useState<StatusKind>("idle");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(adminTokenStorageKey);
    if (savedToken) {
      setToken(savedToken);
      refreshProducts();
    }
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runBusy("login", async () => {
      setStatus("Logging in...", "idle");
      const response = await loginUser({ email, password });
      if (!response.user.is_admin) {
        throw new Error("This account is not an admin.");
      }
      window.localStorage.setItem(adminTokenStorageKey, response.access_token);
      setToken(response.access_token);
      setUser(response.user);
      await refreshProducts();
      setStatus(`Signed in as ${response.user.email}`, "success");
    });
  }

  function logout() {
    window.localStorage.removeItem(adminTokenStorageKey);
    setToken(null);
    setUser(null);
    setProducts([]);
    setDrafts({});
    setStatus("Signed out.", "idle");
  }

  async function refreshProducts() {
    const nextProducts = await fetchProducts();
    setProducts(nextProducts);
    setDrafts(
      Object.fromEntries(
        nextProducts.map((product) => [
          product.id,
          {
            sku: product.sku,
            name: product.name,
            description: product.description,
            price_cents: product.price_cents,
            stock_quantity: product.stock_quantity,
            is_active: product.is_active,
          },
        ]),
      ),
    );
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus("Login before creating products.", "error");
      return;
    }
    await runBusy("create", async () => {
      setStatus("Creating product...", "idle");
      await createProduct(token, newProduct);
      setNewProduct(emptyProductForm);
      await refreshProducts();
      setStatus("Product created.", "success");
    });
  }

  async function handleUpdateProduct(productId: number) {
    if (!token) {
      setStatus("Login before updating products.", "error");
      return;
    }
    const draft = drafts[productId];
    if (!draft) {
      return;
    }
    await runBusy(`update-${productId}`, async () => {
      setStatus("Updating product...", "idle");
      await updateProduct(token, productId, {
        name: draft.name,
        description: draft.description,
        price_cents: draft.price_cents,
        stock_quantity: draft.stock_quantity,
        is_active: draft.is_active,
      });
      await refreshProducts();
      setStatus("Product updated.", "success");
    });
  }

  async function handleDeleteProduct(productId: number) {
    if (!token) {
      setStatus("Login before removing products.", "error");
      return;
    }
    await runBusy(`delete-${productId}`, async () => {
      setStatus("Removing product...", "idle");
      await deleteProduct(token, productId);
      await refreshProducts();
      setStatus("Product removed.", "success");
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

  function updateDraft(productId: number, patch: Partial<ProductFormState>) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [productId]: {
        ...currentDrafts[productId],
        ...patch,
      },
    }));
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
          <h1 className="mt-2 text-3xl font-semibold">Products</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            className="inline-flex h-9 items-center rounded border border-[var(--border)] bg-white px-3 text-sm font-semibold"
            href="/"
          >
            Operations
          </Link>
          {token ? (
            <button
              className="h-9 rounded border border-[var(--border)] px-3 text-sm font-semibold"
              type="button"
              onClick={logout}
            >
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      <div className={statusClassName(statusKind)} role="status">
        {message}
        {user ? <span className="ml-2 text-[var(--muted)]">{user.email}</span> : null}
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
            disabled={busyAction === "login"}
            type="submit"
          >
            {busyAction === "login" ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : (
        <section className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <form className="rounded border border-[var(--border)] bg-white p-4" onSubmit={handleCreateProduct}>
            <h2 className="text-lg font-semibold">Add product</h2>
            <ProductFields
              allowSkuEdit
              disabled={busyAction === "create"}
              product={newProduct}
              onChange={(patch) => setNewProduct((currentProduct) => ({ ...currentProduct, ...patch }))}
            />
            <button
              className="mt-4 h-10 w-full rounded bg-[var(--accent)] px-3 font-semibold text-white disabled:opacity-60"
              disabled={busyAction === "create"}
              type="submit"
            >
              {busyAction === "create" ? "Creating..." : "Create product"}
            </button>
          </form>

          <section className="rounded border border-[var(--border)] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Product list</h2>
              <button
                className="h-9 rounded border border-[var(--border)] px-3 text-sm font-semibold"
                type="button"
                onClick={refreshProducts}
              >
                Refresh
              </button>
            </div>
            <div className="mt-4 max-h-[680px] overflow-y-auto pr-1">
              {products.length > 0 ? (
                products.map((product) => {
                  const draft = drafts[product.id];
                  if (!draft) {
                    return null;
                  }
                  return (
                    <article key={product.id} className="border-b border-[var(--border)] py-4 last:border-b-0">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-[var(--muted)]">{product.sku}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="h-9 rounded bg-[var(--accent)] px-3 text-sm font-semibold text-white disabled:opacity-60"
                            disabled={busyAction === `update-${product.id}`}
                            type="button"
                            onClick={() => handleUpdateProduct(product.id)}
                          >
                            {busyAction === `update-${product.id}` ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="h-9 rounded border border-red-200 px-3 text-sm font-semibold text-red-700 disabled:opacity-60"
                            disabled={busyAction === `delete-${product.id}`}
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            {busyAction === `delete-${product.id}` ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </div>
                      <ProductFields
                        allowSkuEdit={false}
                        disabled={busyAction === `update-${product.id}`}
                        product={draft}
                        onChange={(patch) => updateDraft(product.id, patch)}
                      />
                    </article>
                  );
                })
              ) : (
                <p className="text-sm text-[var(--muted)]">No active products.</p>
              )}
            </div>
          </section>
        </section>
      )}
    </main>
  );
}

type ProductFieldsProps = {
  product: ProductFormState;
  disabled: boolean;
  allowSkuEdit: boolean;
  onChange: (patch: Partial<ProductFormState>) => void;
};

function ProductFields({ product, disabled, allowSkuEdit, onChange }: ProductFieldsProps) {
  return (
    <div className="mt-4 grid gap-3">
      <label className="flex flex-col gap-1 text-sm">
        SKU
        <input
          className="h-10 rounded border border-[var(--border)] px-3 disabled:bg-slate-100"
          disabled={disabled || !allowSkuEdit}
          value={product.sku}
          onChange={(event) => onChange({ sku: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          className="h-10 rounded border border-[var(--border)] px-3"
          disabled={disabled}
          value={product.name}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          className="min-h-20 rounded border border-[var(--border)] px-3 py-2"
          disabled={disabled}
          value={product.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Price cents
          <input
            className="h-10 rounded border border-[var(--border)] px-3"
            disabled={disabled}
            min={0}
            type="number"
            value={product.price_cents}
            onChange={(event) => onChange({ price_cents: Number(event.target.value) })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Quantity
          <input
            className="h-10 rounded border border-[var(--border)] px-3"
            disabled={disabled}
            min={0}
            type="number"
            value={product.stock_quantity}
            onChange={(event) => onChange({ stock_quantity: Number(event.target.value) })}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          checked={product.is_active}
          disabled={disabled}
          type="checkbox"
          onChange={(event) => onChange({ is_active: event.target.checked })}
        />
        Active
      </label>
    </div>
  );
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
