import "server-only";
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import type { ErrorCode, ActionResult } from "@/lib/domain/errors";
import { log } from "@/server/log";

export type { ActionResult } from "@/lib/domain/errors";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly fieldErrors?: Record<string, string>;

  constructor(code: ErrorCode, message?: string, fieldErrors?: Record<string, string>) {
    super(message ?? code);
    this.name = "AppError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function zodFieldErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (key && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err: unknown) {
    unstable_rethrow(err);

    if (err instanceof AppError) {
      return { ok: false, code: err.code, message: err.message, fieldErrors: err.fieldErrors };
    }

    if (err instanceof ZodError) {
      return { ok: false, code: "VALIDATION", fieldErrors: zodFieldErrors(err) };
    }

    log.error("action.unhandled", err);
    return { ok: false, code: "INTERNAL" };
  }
}
