import "server-only";
import { env, isConfigured } from "@/server/env";
import { AppError } from "@/server/result";
import { log } from "@/server/log";

export async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<void> {
  if (!isConfigured("turnstile") || !env.TURNSTILE_SECRET_KEY) {
    if (env.NODE_ENV === "production") {
      throw new AppError("NOT_CONFIGURED");
    }
    return;
  }

  if (!token) {
    throw new AppError("BOT_CHECK_FAILED");
  }

  try {
    const body = new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    });

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      log.error("turnstile.http_error", { status: res.status });
      throw new AppError("BOT_CHECK_FAILED");
    }

    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (data.success !== true) {
      log.warn("turnstile.failed", { errors: data["error-codes"] });
      throw new AppError("BOT_CHECK_FAILED");
    }
  } catch (err: unknown) {
    if (err instanceof AppError) throw err;
    log.error("turnstile.network_error", err);
    throw new AppError("BOT_CHECK_FAILED");
  }
}
