import { Hono } from "hono";
import { config } from "../lib/garage";

export const configRoute = new Hono()

  /**
   * Get garage config
   */
  .get("/", async (c) => {
    const data = {
      ...(config || {}),
      rpc_secret: undefined,
      admin: {
        ...(config?.admin || {}),
        admin_token: undefined,
        metrics_token: undefined,
      },
    };

    return c.json(data);
  });
