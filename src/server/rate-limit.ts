import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { rateLimits } from "@/server/db/schema/core";
import { AppError } from "@/server/result";

export async function rateLimit(
  bucket: string,
  id: string,
  limit: number,
  windowSec: number,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const w = Math.floor(now / windowSec) * windowSec;
  const key = `${bucket}:${id}`;

  const rows = await db
    .insert(rateLimits)
    .values({ key, windowStart: w, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.windowStart} = ${w} THEN ${rateLimits.count} + 1 ELSE 1 END`,
        windowStart: w,
      },
    })
    .returning({ count: rateLimits.count });

  const current = rows[0]?.count ?? 1;
  if (current > limit) {
    throw new AppError("RATE_LIMITED");
  }
}
