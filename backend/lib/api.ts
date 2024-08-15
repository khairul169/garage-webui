import { config } from "./garage";

type FetchOptions = Omit<RequestInit, "headers" | "body"> & {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
};

const adminPort = config?.admin?.api_bind_addr?.split(":").pop();
const adminAddr =
  import.meta.env.API_BASE_URL ||
  config?.rpc_public_addr?.split(":")[0] + ":" + adminPort ||
  "";

export const API_BASE_URL =
  !adminAddr.startsWith("http") && !adminAddr.startsWith("https")
    ? `http://${adminAddr}`
    : adminAddr;

export const API_ADMIN_KEY =
  import.meta.env.API_ADMIN_KEY || config?.admin?.admin_token;

const api = {
  async fetch<T = any>(url: string, options?: Partial<FetchOptions>) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${API_ADMIN_KEY}`,
    };
    const _url = new URL(API_BASE_URL + url);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        _url.searchParams.set(key, String(value));
      });
    }

    if (
      typeof options?.body === "object" &&
      !(options.body instanceof FormData)
    ) {
      options.body = JSON.stringify(options.body);
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(_url, {
      ...options,
      headers: { ...headers, ...(options?.headers || {}) },
    });

    if (!res.ok) {
      const err = new Error(res.statusText);
      (err as any).status = res.status;
      throw err;
    }

    const isJson = res.headers
      .get("Content-Type")
      ?.includes("application/json");

    if (isJson) {
      const json = (await res.json()) as T;
      return json;
    }

    const text = await res.text();
    return text as unknown as T;
  },

  async get<T = any>(url: string, options?: Partial<FetchOptions>) {
    return this.fetch<T>(url, {
      ...options,
      method: "GET",
    });
  },

  async post<T = any>(url: string, options?: Partial<FetchOptions>) {
    return this.fetch<T>(url, {
      ...options,
      method: "POST",
    });
  },
};

export default api;
