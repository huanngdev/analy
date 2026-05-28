import type { MiddlewareHandler } from "hono";

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

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const startedAt = performance.now();
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;

  console.log(
    `${color.gray("api")} ${color.cyan("in")}  ${color.blue(method)} ${path}`,
  );

  try {
    await next();
  } catch (error) {
    console.log(
      `${color.gray("api")} ${color.red("out")} ${color.red("500")} ${color.blue(method)} ${path} ${color.dim(formatDuration(startedAt))}`,
    );

    throw error;
  }

  const status = c.res.status;

  console.log(
    `${color.gray("api")} ${color.green("out")} ${statusColor(status)(String(status))} ${color.blue(method)} ${path} ${color.dim(formatDuration(startedAt))}`,
  );
};

export function logApiStartup(port: number) {
  const url = `http://localhost:${port}`;

  console.log("");
  console.log(
    `${color.gray("api")} ${color.green("ready")} ${color.blue(url)}`,
  );
  console.log(`${color.gray("api")} ${color.dim("press Ctrl+C to stop")}`);
  console.log("");
}
