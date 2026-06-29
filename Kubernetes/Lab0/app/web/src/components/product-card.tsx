import type { ProductRead } from "@/lib/api";

type ProductCardProps = {
  product: ProductRead;
  onAddToCart: (productId: number) => void;
  isBusy: boolean;
  isAuthenticated: boolean;
};

export function ProductCard({ product, onAddToCart, isBusy, isAuthenticated }: ProductCardProps) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price_cents / 100);

  return (
    <article className="rounded border border-[var(--border)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{product.name}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{product.description}</p>
        </div>
        <span className="shrink-0 rounded bg-teal-50 px-2 py-1 text-sm font-semibold text-teal-800">
          {price}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <div className="min-w-0">
          <p className="truncate">{product.sku}</p>
          <p>{product.stock_quantity} in stock</p>
        </div>
        <button
          className="h-10 shrink-0 rounded bg-[var(--accent)] px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy || product.stock_quantity < 1}
          type="button"
          onClick={() => onAddToCart(product.id)}
        >
          {isBusy ? "Adding..." : isAuthenticated ? "Add" : "Sign in"}
        </button>
      </div>
    </article>
  );
}
