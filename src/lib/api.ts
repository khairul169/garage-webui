import * as utils from "@/lib/utils";
import { BASE_PATH } from "./consts";

type FetchOptions = Omit<RequestInit, "headers" | "body"> & {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
};

export const API_URL = BASE_PATH + "/api";

export class APIError extends Error {
  status!: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

const api = {
  async fetch<T = any>(url: string, options?: Partial<FetchOptions>) {
    const headers: Record<string, string> = {};
    const _url = new URL(API_URL + url, window.location.origin);

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
      credentials: "include",
      headers: { ...headers, ...(options?.headers || {}) },
    });

    const isJson = res.headers
      .get("Content-Type")
      ?.includes("application/json");
    const data = isJson ? await res.json() : await res.text();

    if (res.status === 401 && !url.startsWith("/auth")) {
      window.location.href = utils.url("/auth/login");
      throw new APIError("unauthorized", res.status);
    }

    if (!res.ok) {
      const message = isJson
        ? data?.message
        : typeof data === "string"
        ? data
        : res.statusText;
      throw new APIError(message, res.status);
    }

    return data as unknown as T;
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

  async put<T = any>(url: string, options?: Partial<FetchOptions>) {
    return this.fetch<T>(url, {
      ...options,
      method: "PUT",
    });
  },

  async delete<T = any>(url: string, options?: Partial<FetchOptions>) {
    return this.fetch<T>(url, {
      ...options,
      method: "DELETE",
    });
  },
};

export default api;
