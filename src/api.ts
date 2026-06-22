export type RoleName = "Superadmin" | "Vendedor" | "Visualizador";

export const Roles = {
  Superadmin: 0,
  Vendedor: 1,
  Visualizador: 2,
} as const;

export const Gender = {
  Male: 0,
  Female: 1,
  Other: 2,
  Unspecified: 3,
} as const;

export const SaleStatus = {
  Completed: 0,
  Returned: 1,
  PartiallyReturned: 2,
  Cancelled: 3,
} as const;

export const ReturnReason = {
  Defective: 0,
  WrongSize: 1,
  WrongItem: 2,
  CustomerChange: 3,
  Other: 99,
} as const;

export const ReturnStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;

export const roleLabels: Record<number, RoleName> = {
  [Roles.Superadmin]: "Superadmin",
  [Roles.Vendedor]: "Vendedor",
  [Roles.Visualizador]: "Visualizador",
};

export const genderLabels: Record<number, string> = {
  [Gender.Male]: "Masculino",
  [Gender.Female]: "Femenino",
  [Gender.Other]: "Otro",
  [Gender.Unspecified]: "No especificado",
};

export const saleStatusLabels: Record<number, string> = {
  [SaleStatus.Completed]: "Completada",
  [SaleStatus.Returned]: "Devuelta",
  [SaleStatus.PartiallyReturned]: "Parcial",
  [SaleStatus.Cancelled]: "Cancelada",
};

export const returnReasonLabels: Record<number, string> = {
  [ReturnReason.Defective]: "Defectuoso",
  [ReturnReason.WrongSize]: "Talla incorrecta",
  [ReturnReason.WrongItem]: "Producto incorrecto",
  [ReturnReason.CustomerChange]: "Cambio del cliente",
  [ReturnReason.Other]: "Otro",
};

export const returnStatusLabels: Record<number, string> = {
  [ReturnStatus.Pending]: "Pendiente",
  [ReturnStatus.Approved]: "Aprobada",
  [ReturnStatus.Rejected]: "Rechazada",
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  role: number;
  isActive: boolean;
  createdAt: string;
};

export type Product = {
  productId: string;
  category: string;
  color: string;
  size: string;
  season: string;
  supplierId: string | null;
  supplierCode: string | null;
  supplierName: string | null;
  costPrice: number;
  listPrice: number;
  isActive: boolean;
};

export type Customer = {
  customerId: string;
  age: number;
  gender: number;
  city: string;
  email: string;
  isActive: boolean;
};

export type Store = {
  storeId: string;
  storeName: string;
  region: string;
  storeSizeM2: number;
  channel: number;
  isActive: boolean;
};

export type InventoryItem = {
  id: string;
  productId: string;
  storeId: string;
  stockOnHand: number;
  reservedStock: number;
  availableStock: number;
  updatedAt: string;
};

export type SaleItemRequest = {
  productId: string;
  quantity: number;
  discount: number;
};

export type SaleItem = SaleItemRequest & {
  id: string;
  unitListPrice: number;
  unitCostPrice: number;
  revenue: number;
  margin: number;
};

export type Sale = {
  transactionId: string;
  date: string;
  storeId: string;
  storeName: string;
  customerId: string;
  status: number;
  totalRevenue: number;
  totalMargin: number;
  totalDiscount: number;
  totalQuantity: number;
  items: SaleItem[];
};

export type ReturnRecord = {
  id: string;
  transactionId: string;
  date: string;
  reason: number;
  status: number;
  approvedByUserId: string | null;
  notes: string | null;
  createdAt: string;
  approvedAt: string | null;
};

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: "Bearer";
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: RoleName[];
};

export type Session = TokenResponse & {
  user: AuthUser;
};

export type CreateProductInput = Omit<Product, "supplierCode" | "supplierName" | "isActive">;
export type CreateCustomerInput = Omit<Customer, "isActive">;
export type CreateSaleInput = Pick<Sale, "transactionId" | "date" | "storeId" | "customerId"> & {
  items: SaleItemRequest[];
};
export type CreateReturnInput = Pick<ReturnRecord, "transactionId" | "date" | "reason" | "notes">;
export type CreateUserInput = Pick<ApiUser, "fullName" | "email" | "role"> & {
  password: string;
};

const fallbackApiBaseUrl = "https://alloydb-crud-api-dmkxnmuy3q-ue.a.run.app";
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const apiBaseUrl = (configuredApiBaseUrl || fallbackApiBaseUrl).replace(/\/$/, "");
const sessionKey = "retail-crm-pos-session";
const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split(".");
  if (!payload) return {};
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return JSON.parse(atob(padded)) as Record<string, unknown>;
}

function toRoleList(raw: unknown): RoleName[] {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values.filter(
    (role): role is RoleName =>
      role === "Superadmin" || role === "Vendedor" || role === "Visualizador",
  );
}

export function sessionFromToken(token: TokenResponse): Session {
  const payload = decodeJwtPayload(token.accessToken);
  return {
    ...token,
    user: {
      id: String(payload.sub ?? ""),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? payload.email ?? "Usuario"),
      roles: toRoleList(payload[roleClaim] ?? payload.role ?? payload.roles),
    },
  };
}

export function loadSession(): Session | null {
  const raw = window.localStorage.getItem(sessionKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    window.localStorage.removeItem(sessionKey);
    return null;
  }
}

export function saveSession(session: Session) {
  window.localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(sessionKey);
}

function queryString(query?: Record<string, unknown>) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

async function parseError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const message = await response.text().catch(() => "");
    return message || `La API respondio con HTTP ${response.status}.`;
  }
  const body = (await response.json().catch(() => null)) as {
    error?: string;
    title?: string;
    errors?: Record<string, string[]>;
  } | null;
  if (body?.errors) {
    return Object.values(body.errors).flat().join(" ");
  }
  return body?.error || body?.title || `La API respondio con HTTP ${response.status}.`;
}

async function refreshSession(current: Session): Promise<Session | null> {
  const response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });

  if (!response.ok) return null;
  const refreshed = sessionFromToken((await response.json()) as TokenResponse);
  saveSession(refreshed);
  return refreshed;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, unknown>;
  auth?: boolean;
  retry?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, retry = true } = options;
  let session = loadSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth && session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  const response = await fetch(`${apiBaseUrl}${path}${queryString(options.query)}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401 && auth && retry && session?.refreshToken) {
    session = await refreshSession(session);
    if (session) return request<T>(path, { ...options, retry: false });
    clearSession();
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  baseUrl: apiBaseUrl,
  auth: {
    login: async (email: string, password: string) => {
      const token = await request<TokenResponse>("/api/auth/login", {
        method: "POST",
        auth: false,
        body: { email, password },
      });
      const session = sessionFromToken(token);
      saveSession(session);
      return session;
    },
  },
  users: {
    list: (query?: { page?: number; pageSize?: number }) =>
      request<PagedResult<ApiUser>>("/api/users", { query }),
    create: (body: CreateUserInput) => request<ApiUser>("/api/users", { method: "POST", body }),
  },
  products: {
    list: (query?: {
      category?: string;
      season?: string;
      supplierId?: string;
      includeInactive?: boolean;
      page?: number;
      pageSize?: number;
    }) => request<PagedResult<Product>>("/api/products", { query }),
    get: (productId: string) => request<Product>(`/api/products/${encodeURIComponent(productId)}`),
    create: (body: CreateProductInput) =>
      request<Product>("/api/products", { method: "POST", body }),
  },
  customers: {
    list: (query?: {
      city?: string;
      gender?: number;
      includeInactive?: boolean;
      page?: number;
      pageSize?: number;
    }) => request<PagedResult<Customer>>("/api/customers", { query }),
    get: (customerId: string) =>
      request<Customer>(`/api/customers/${encodeURIComponent(customerId)}`),
    create: (body: CreateCustomerInput) =>
      request<Customer>("/api/customers", { method: "POST", body }),
  },
  stores: {
    list: () => request<Store[]>("/api/inventory/stores"),
  },
  inventory: {
    list: (query?: { storeId?: string; productId?: string; page?: number; pageSize?: number }) =>
      request<PagedResult<InventoryItem>>("/api/inventory", { query }),
    get: (storeId: string, productId: string) =>
      request<InventoryItem>("/api/inventory/by", { query: { storeId, productId } }),
  },
  sales: {
    list: (query?: {
      storeId?: string;
      customerId?: string;
      fromDate?: string;
      toDate?: string;
      status?: number;
      page?: number;
      pageSize?: number;
    }) => request<PagedResult<Sale>>("/api/sales", { query }),
    get: (transactionId: string) =>
      request<Sale>(`/api/sales/${encodeURIComponent(transactionId)}`),
    create: (body: CreateSaleInput) => request<Sale>("/api/sales", { method: "POST", body }),
  },
  returns: {
    get: (id: string) => request<ReturnRecord>(`/api/returns/${id}`),
    create: (body: CreateReturnInput) =>
      request<ReturnRecord>("/api/returns", { method: "POST", body }),
  },
};

export function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}
