type FetchOptions = Omit<RequestInit, "headers" | "body"> & {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
};

const ADMIN_KEY = "E1tDBf4mhc/XMHq1YJkDE6N1j3AZG9dRWR+vDDTyASk=";

const api = {
  async fetch<T = any>(url: string, options?: Partial<FetchOptions>) {
    const headers: Record<string, string> = {};
    const _url = new URL("/api" + url, window.location.origin);

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

    if (ADMIN_KEY) {
      headers["Authorization"] = `Bearer ${ADMIN_KEY}`;
    }

    const res = await fetch(_url, {
      ...options,
      headers: { ...headers, ...(options?.headers || {}) },
    });

    if (!res.ok) {
      throw new Error(res.statusText);
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
