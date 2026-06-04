import { OpenAPIHono } from "@hono/zod-openapi";

import { authRoutes } from "@/features/auth/auth-routes";
import { postgresRoutes } from "@/features/postgres/postgres-routes";
import { requestLogger } from "@/lib/logger";
import { corsMiddleware } from "@/middleware/cors";
import { errorHandler } from "@/middleware/error-handler";
import { notFoundHandler } from "@/middleware/not-found";
import { rateLimitMiddleware } from "@/middleware/rate-limit";
import { requestIdMiddleware } from "@/middleware/request-id";
import { securityMiddleware } from "@/middleware/security";
import type { AppBindings } from "@/server/app-bindings";
import { registerApiDocs } from "@/server/open-api";
import { registerSystemRoutes } from "@/server/system-routes";

const app = new OpenAPIHono<AppBindings>();

app.use("*", securityMiddleware);
app.use("*", corsMiddleware);
app.use("*", requestIdMiddleware);
app.use("*", requestLogger);
app.use("*", rateLimitMiddleware);

registerApiDocs(app);
registerSystemRoutes(app);
app.route("/auth", authRoutes);
app.route("/postgres", postgresRoutes);

app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
