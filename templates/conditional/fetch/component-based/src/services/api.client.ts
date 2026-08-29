import { apiConfig } from "@/config/api.config";

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<{ data: T }> {
  const token = localStorage.getItem("access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiConfig.baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as T;

  return { data };
}

const api = {
  get<T>(endpoint: string): Promise<{ data: T }> {
    return request<T>(endpoint);
  },

  post<T>(endpoint: string, body?: unknown): Promise<{ data: T }> {
    return request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
  },

  put<T>(endpoint: string, body?: unknown): Promise<{ data: T }> {
    return request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) });
  },

  delete<T>(endpoint: string): Promise<{ data: T }> {
    return request<T>(endpoint, { method: "DELETE" });
  },
};

export default api;