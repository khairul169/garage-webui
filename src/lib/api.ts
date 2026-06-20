import * as utils from "@/lib/utils";
import { BASE_PATH } from "./consts";

type FetchOptions = Omit<RequestInit, "headers" | "body"> & {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  body?: any;
};

type UploadProgressEvent = {
  percent: number;
  phase: "uploading" | "finishing";
};

type UploadOptions = {
  params?: Record<string, any>;
  onProgress?: (event: UploadProgressEvent) => void;
  timeoutMs?: number;
};

export type UploadHandle<T = unknown> = {
  promise: Promise<T>;
  abort: () => void;
};

/** Default upload timeout aligned with nginx proxy_read_timeout for /oss/. */
const DEFAULT_UPLOAD_TIMEOUT_MS = 3_600_000;

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

  upload<T = any>(
    url: string,
    body: FormData,
    options?: UploadOptions
  ): UploadHandle<T> {
    const _url = new URL(API_URL + url, window.location.origin);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        _url.searchParams.set(key, String(value));
      });
    }

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", _url.toString(), true);
    xhr.withCredentials = true;
    xhr.timeout = options?.timeoutMs ?? DEFAULT_UPLOAD_TIMEOUT_MS;

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable || !options?.onProgress) return;

      const sentPercent = Math.round((event.loaded / event.total) * 100);
      options.onProgress({
        phase: "uploading",
        percent: Math.min(95, sentPercent),
      });
    });

    xhr.upload.addEventListener("load", () => {
      options?.onProgress?.({ phase: "finishing", percent: 99 });
    });

    const promise = new Promise<T>((resolve, reject) => {
      xhr.addEventListener("load", () => {
        const contentType = xhr.getResponseHeader("Content-Type") || "";
        const isJson = contentType.includes("application/json");
        let data: unknown;

        try {
          data = isJson ? JSON.parse(xhr.responseText) : xhr.responseText;
        } catch {
          reject(new APIError("Invalid response", xhr.status));
          return;
        }

        if (xhr.status === 401 && !url.startsWith("/auth")) {
          window.location.href = utils.url("/auth/login");
          reject(new APIError("unauthorized", xhr.status));
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          const message = isJson
            ? (data as { message?: string })?.message
            : typeof data === "string"
            ? data
            : xhr.statusText;
          reject(new APIError(message || xhr.statusText, xhr.status));
          return;
        }

        resolve(data as T);
      });

      xhr.addEventListener("abort", () => {
        reject(new APIError("Upload aborted", 0));
      });

      xhr.addEventListener("error", () => {
        reject(new APIError("Network error", 0));
      });

      xhr.addEventListener("timeout", () => {
        reject(
          new APIError("Upload timed out while waiting for the server", 504)
        );
      });

      xhr.send(body);
    });

    return {
      promise,
      abort: () => xhr.abort(),
    };
  },

  async delete<T = any>(url: string, options?: Partial<FetchOptions>) {
    return this.fetch<T>(url, {
      ...options,
      method: "DELETE",
    });
  },
};

export default api;
