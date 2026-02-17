import { Hono } from "hono";
import healthRoute from "./health.route";
import authRoute from "./auth.route";

const routes = new Hono();

routes.route("/health", healthRoute);
routes.route("/auth", authRoute);

export default routes;
