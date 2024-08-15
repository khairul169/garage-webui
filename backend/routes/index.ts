import { Hono } from "hono";
import { buckets } from "./buckets";
import { configRoute } from "./config";

const router = new Hono()
  //
  .route("/config", configRoute)
  .route("/buckets", buckets);

export default router;
