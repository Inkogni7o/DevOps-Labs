import { getApiBaseUrl } from "@/lib/config";

export type ProductRead = {
  id: number;
  sku: string;
  name: string;
  description: string;
  price_cents: number;
  stock_quantity: number;
  is_active: boolean;
};

export type RegisterRequest = {
  email: string;
  password: string;
  full_name: string;
};

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

export type CartItemRead = {
  id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  unit_price_cents: number;
  line_total_cents: number;
};

export type CartRead = {
  items: CartItemRead[];
  total_cents: number;
};

export type OrderItemRead = {
  id: number;
  product_id: number;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

export type OrderRead = {
  id: number;
  status: string;
  total_cents: number;
  items: OrderItemRead[];
};

export type PaymentRead = {
  id: number;
  order_id: number;
  status: string;
  amount_cents: number;
  provider_reference: string;
};

export async function fetchProducts(): Promise<ProductRead[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/products`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch {
    return [];
  }
}

export async function registerUser(request: RegisterRequest): Promise<UserRead> {
  return apiRequest<UserRead>("/api/users/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function loginUser(request: LoginRequest): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function fetchProfile(token: string): Promise<UserRead> {
  return apiRequest<UserRead>("/api/users/profile", { token });
}

export async function fetchCart(token: string): Promise<CartRead> {
  return apiRequest<CartRead>("/api/cart", { token });
}

export async function addCartItem(token: string, productId: number): Promise<CartRead> {
  return apiRequest<CartRead>("/api/cart/items", {
    method: "POST",
    token,
    body: JSON.stringify({ product_id: productId, quantity: 1 }),
  });
}

export async function removeCartItem(token: string, productId: number): Promise<CartRead> {
  return apiRequest<CartRead>(`/api/cart/items/${productId}`, {
    method: "DELETE",
    token,
  });
}

export async function updateCartItem(
  token: string,
  productId: number,
  quantity: number,
): Promise<CartRead> {
  return apiRequest<CartRead>("/api/cart/items", {
    method: "PATCH",
    token,
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function createOrder(token: string): Promise<OrderRead> {
  return apiRequest<OrderRead>("/api/orders", {
    method: "POST",
    token,
  });
}

export async function fetchOrders(token: string): Promise<OrderRead[]> {
  return apiRequest<OrderRead[]>("/api/orders", { token });
}

export async function payOrder(token: string, orderId: number): Promise<PaymentRead> {
  return apiRequest<PaymentRead>("/api/payments/pay-order", {
    method: "POST",
    token,
    body: JSON.stringify({ order_id: orderId }),
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
