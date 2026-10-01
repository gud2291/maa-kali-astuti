import "server-only";

function formatError(err: Error): { error: string; stack: string } {
  const lines = (err.stack ?? "").split("\n").slice(0, 5).join(" | ");
  return { error: err.message, stack: lines };
}

function normalizeData(data: unknown): Record<string, unknown> {
  if (data instanceof Error) return formatError(data);
  if (data !== null && typeof data === "object") return data as Record<string, unknown>;
  if (data !== undefined) return { data };
  return {};
}

function write(
  level: "info" | "warn" | "error",
  method: (msg: string) => void,
  event: string,
  data?: unknown,
): void {
  const entry = { t: new Date().toISOString(), level, event, ...normalizeData(data) };
  method(JSON.stringify(entry));
}

export const log = {
  info: (event: string, data?: unknown): void => write("info", console.info, event, data),
  warn: (event: string, data?: unknown): void => write("warn", console.warn, event, data),
  error: (event: string, data?: unknown): void => write("error", console.error, event, data),
};

export function maskEmail(e: string): string {
  const at = e.indexOf("@");
  if (at <= 1) return e;
  return e.slice(0, 2) + "***" + e.slice(at);
}

export function maskPhone(p: string): string {
  if (p.length <= 4) return p;
  return "*".repeat(p.length - 4) + p.slice(-4);
}
