import { Hono } from "hono";
import { logger } from "hono/logger";
import router from "./routes";
import { proxyApi } from "./lib/proxy-api";

const HOST = import.meta.env.HOST || "0.0.0.0";
const PORT = Number(import.meta.env.PORT) || 3909;

const app = new Hono();

app.use(logger());

// API router
app.route("/", router);

// Proxy to garage admin API
app.all("*", proxyApi);

export default {
  fetch: app.fetch,
  hostname: HOST,
  port: PORT,
};
