import { Hono } from "hono";
import { healthController } from "../controllers";

const healthRoute = new Hono();

healthRoute.get("/", healthController.getHealth);

export default healthRoute;
