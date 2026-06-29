import { getApiBaseUrl } from "@/lib/config";

export type LoginRequest = {
  email: string;
  password: string;
};

export type UserRead = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: UserRead;
};

export type AdminUserRead = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
};

export type AdminOrderStatusRead = {
  status: string;
  count: number;
};

export type AdminOrderRead = {
  id: number;
  user_id: number;
  customer_email: string;
  customer_name: string;
  status: string;
  total_cents: number;
};

export type AdminSummaryRead = {
  users_count: number;
  products_count: number;
  orders_count: number;
  total_revenue_cents: number;
  failed_jobs_count: number;
  orders_by_status: AdminOrderStatusRead[];
  recent_users: AdminUserRead[];
  recent_orders: AdminOrderRead[];
};

export type ProductRead = {
  id: number;
  sku: string;
  name: string;
  description: string;
  price_cents: number;
  stock_quantity: number;
  is_active: boolean;
};

export type ProductCreate = {
  sku: string;
  name: string;
  description: string;
  price_cents: number;
  stock_quantity: number;
  is_active: boolean;
};

export type ProductUpdate = {
  name?: string;
  description?: string;
  price_cents?: number;
  stock_quantity?: number;
  is_active?: boolean;
};

export async function loginUser(request: LoginRequest): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function fetchAdminSummary(token: string): Promise<AdminSummaryRead> {
  return apiRequest<AdminSummaryRead>("/api/admin/summary", { token });
}

export async function fetchProducts(): Promise<ProductRead[]> {
  return apiRequest<ProductRead[]>("/api/products");
}

export async function createProduct(
  token: string,
  request: ProductCreate,
): Promise<ProductRead> {
  return apiRequest<ProductRead>("/api/products", {
    method: "POST",
    token,
    body: JSON.stringify(request),
  });
}

export async function updateProduct(
  token: string,
  productId: number,
  request: ProductUpdate,
): Promise<ProductRead> {
  return apiRequest<ProductRead>(`/api/products/${productId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(request),
  });
}

export async function deleteProduct(token: string, productId: number): Promise<void> {
  await apiRequest<void>(`/api/products/${productId}`, {
    method: "DELETE",
    token,
  });
}

type ApiRequestInit = RequestInit & {
  token?: string;
};

async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (init.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message ?? "Request failed.";
    throw new Error(message);
  }
  return payload as T;
}
