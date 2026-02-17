import { Hono } from "hono";
import healthRoute from "./health";

const routes = new Hono();

routes.route("/health", healthRoute);

export default routes;
