import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/server/env";
import { sha256Hex, safeEqualHex } from "@/server/ids";
import { runDailyCron } from "@/server/cron/daily";

export const maxDuration = 60;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!env.CRON_SECRET) {
    return NextResponse.json(
      { error: "NOT_CONFIGURED", message: "CRON_SECRET is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const given = auth.slice("Bearer ".length).trim();
  const valid = safeEqualHex(sha256Hex(given), sha256Hex(env.CRON_SECRET));

  if (!valid) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const summary = await runDailyCron();
  return NextResponse.json(summary, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
