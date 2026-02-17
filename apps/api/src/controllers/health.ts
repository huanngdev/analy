import type { Context } from "hono";
import { HealthStatus, type HealthResponse } from "@repo/shared";

export const healthController = {
  getHealth: async (c: Context) => {
    return c.json<HealthResponse>({
      status: HealthStatus.OK,
      message: "Healthy",
    });
  },
};
