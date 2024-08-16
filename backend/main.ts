import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import router from "./routes";
import { __PROD } from "./lib/consts";

const HOST = import.meta.env.HOST || "0.0.0.0";
const PORT = Number(import.meta.env.PORT) || 3909;
const DIST_ROOT = import.meta.env.DIST_ROOT || "./dist";

const app = new Hono();

app.use(logger());

// API router
app.route("/api", router);

if (__PROD) {
  // Serve client dist
  app.use(serveStatic({ root: DIST_ROOT }));
  app.use(async (c, next) => {
    try {
      const file = Bun.file(DIST_ROOT + "/index.html");
      return c.html(await file.text());
    } catch (err) {
      next();
    }
  });

  console.log(`Listening on http://${HOST}:${PORT}`);
}

export default {
  fetch: app.fetch,
  hostname: HOST,
  port: PORT,
};
