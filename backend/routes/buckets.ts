import { Hono } from "hono";
import api from "../lib/api";

export const buckets = new Hono()

  /**
   * Get all buckets
   */
  .get("/", async (c) => {
    const data = await api.get("/v1/bucket?list");

    const buckets = await Promise.all(
      data.map(async (bucket: any) => {
        return api.get("/v1/bucket", { params: { id: bucket.id } });
      })
    );

    return c.json(buckets);
  });
