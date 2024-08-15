import type { Context } from "hono";
import { API_ADMIN_KEY, API_BASE_URL } from "./api";

export const proxyApi = async (c: Context) => {
  const url = new URL(c.req.url);
  const reqUrl = new URL(API_BASE_URL + url.pathname + url.search);

  try {
    const headers = c.req.raw.headers;
    let body: BodyInit | ReadableStream<Uint8Array> | null = c.req.raw.body;

    headers.set("authorization", `Bearer ${API_ADMIN_KEY}`);

    if (headers.get("content-type")?.includes("application/json")) {
      const json = await c.req.json();
      body = JSON.stringify(json);
    }

    const res = await fetch(reqUrl, {
      ...c.req.raw,
      method: c.req.method,
      headers,
      body,
    });
    return res;
  } catch (err) {
    return c.json(
      {
        success: false,
        error: (err as Error)?.message || "Server error",
      },
      500
    );
  }
};
