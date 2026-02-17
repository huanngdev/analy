import { Hono } from "hono";
import env from "./config/env";
import { logger } from "hono/logger";
import { customLogger } from "./config/pino";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import routes from "./routes";

const app = new Hono();

app.use(logger(customLogger));
app.use(requestId());
app.use(secureHeaders());
app.use(
  cors({
    origin: "*",
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    exposeHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);

app.route("/api", routes);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
