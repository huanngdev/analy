import type { MiddlewareHandler } from "hono";

import type { AppBindings } from "@/app-bindings";

const colorEnabled = process.env.NO_COLOR === undefined;

const color = {
  blue: (value: string) => paint(value, "34"),
  cyan: (value: string) => paint(value, "36"),
  dim: (value: string) => paint(value, "2"),
  gray: (value: string) => paint(value, "90"),
  green: (value: string) => paint(value, "32"),
  red: (value: string) => paint(value, "31"),
  yellow: (value: string) => paint(value, "33"),
};

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

function paint(value: string, code: string) {
  if (!colorEnabled) {
    return value;
  }

  return `\u001B[${code}m${value}\u001B[0m`;
}

function statusColor(status: number) {
  if (status >= 500) {
    return color.red;
  }

  if (status >= 400) {
    return color.yellow;
  }

  if (status >= 300) {
    return color.cyan;
  }

  return color.green;
}

function formatDuration(startedAt: number) {
  return `${Math.round(performance.now() - startedAt)}ms`;
}

export const requestLogger: MiddlewareHandler<AppBindings> = async (
  c,
  next,
) => {
  const startedAt = performance.now();
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;
  const requestId = c.get("requestId");
  const requestLabel = requestId ? ` ${color.dim(requestId)}` : "";

  console.log(
    `${color.gray("api")} ${color.cyan("in")}  ${color.blue(method)} ${path}${requestLabel}`,
  );

  try {
    await next();
  } catch (error) {
    console.log(
      `${color.gray("api")} ${color.red("out")} ${color.red("500")} ${color.blue(method)} ${path} ${color.dim(formatDuration(startedAt))}${requestLabel}`,
    );

    throw error;
  }

  const status = c.res.status;

  console.log(
    `${color.gray("api")} ${color.green("out")} ${statusColor(status)(String(status))} ${color.blue(method)} ${path} ${color.dim(formatDuration(startedAt))}${requestLabel}`,
  );
};

export function logApiStartup(
  port: number,
  nodeEnv: string,
  corsOrigins: string[],
) {
  const url = `http://localhost:${port}`;

  console.log("");
  console.log(
    `${color.gray("api")} ${color.green("ready")} ${color.blue(url)}`,
  );
  console.log(`${color.gray("api")} ${color.dim(`env ${nodeEnv}`)}`);
  console.log(
    `${color.gray("api")} ${color.dim(`cors ${corsOrigins.join(", ")}`)}`,
  );
  console.log(`${color.gray("api")} ${color.dim("press Ctrl+C to stop")}`);
  console.log("");
}

export function logDatabaseConnecting() {
  console.log(`${color.gray("db")} ${color.cyan("connect")} PostgreSQL`);
}

export function logDatabaseReady() {
  console.log(`${color.gray("db")} ${color.green("ready")} PostgreSQL`);
}

export function logDatabaseError(error: unknown) {
  console.error(
    `${color.gray("db")} ${color.red("error")} PostgreSQL ${color.dim(formatError(error))}`,
  );
}

export function logRedisConnecting() {
  console.log(`${color.gray("redis")} ${color.cyan("connect")} Redis`);
}

export function logRedisReady() {
  console.log(`${color.gray("redis")} ${color.green("ready")} Redis`);
}

export function logRedisError(error: unknown) {
  console.error(
    `${color.gray("redis")} ${color.red("error")} Redis ${color.dim(formatError(error))}`,
  );
}

export function logUnhandledError(error: unknown, requestId: string) {
  console.error(
    `${color.gray("api")} ${color.red("error")} ${color.dim(requestId)} ${color.dim(formatError(error))}`,
  );
}
