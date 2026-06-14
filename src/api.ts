export type Item = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
};

export type ItemInput = {
  name: string;
  description: string | null;
};

const fallbackApiBaseUrl = "https://alloydb-crud-api-dmkxnmuy3q-ue.a.run.app";
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const apiBaseUrl = (configuredApiBaseUrl || fallbackApiBaseUrl).replace(/\/$/, "");
const itemsUrl = `${apiBaseUrl}/api/items`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `La API respondio con HTTP ${response.status}.`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  baseUrl: apiBaseUrl,
  listItems: () => request<Item[]>(itemsUrl),
  createItem: (item: ItemInput) =>
    request<Item>(itemsUrl, {
      method: "POST",
      body: JSON.stringify(item),
    }),
  updateItem: (id: number, item: ItemInput) =>
    request<void>(`${itemsUrl}/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, ...item }),
    }),
  deleteItem: (id: number) =>
    request<void>(`${itemsUrl}/${id}`, {
      method: "DELETE",
    }),
};
