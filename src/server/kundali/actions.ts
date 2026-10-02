"use server";

import { runAction, type ActionResult } from "@/server/result";
import { clientIp } from "@/server/ip";
import { rateLimit } from "@/server/rate-limit";
import { chartInputSchema } from "@/lib/validation/kundali";
import { computeChart } from "@/server/kundali/engine";
import type { ChartSnapshot } from "@/lib/domain/kundali";

export async function computeChartAction(
  input: unknown,
): Promise<ActionResult<ChartSnapshot>> {
  return runAction(async () => {
    const data = chartInputSchema.parse(input);

    const ip = await clientIp();
    await rateLimit("chart:ip", ip, 30, 3600);

    return computeChart({
      name: data.name,
      dob: data.dob,
      tob: data.tob,
      tobUnknown: data.tobUnknown,
      place: data.place.name,
      lat: data.place.lat,
      lon: data.place.lon,
      tz: data.place.tz,
    });
  });
}
