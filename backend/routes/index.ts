import { Hono } from "hono";
import { buckets } from "./buckets";
import { configRoute } from "./config";
import { proxyApi } from "../lib/proxy-api";

const router = new Hono()
  //
  .route("/config", configRoute)
  .route("/buckets", buckets)

  .all("*", proxyApi);

export default router;
