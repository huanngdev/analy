export enum HealthStatus {
  OK = "ok",
  ERROR = "error",
}

export type HealthResponse = {
  status: HealthStatus;
  message: string;
};
