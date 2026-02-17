import type { Response } from ".";

export enum HealthStatus {
  OK = "ok",
  ERROR = "error",
}

export type HealthResponse = Response<{
  status: HealthStatus;
}>;
