import { type NextRequest } from "next/server";
import { z } from "zod";
import { SERVICE_KEYS, TIER_KEYS } from "@/lib/domain/enums";
import { getDaySlots } from "@/server/bookings/availability";

const querySchema = z.object({
  service: z.enum(SERVICE_KEYS),
  tier: z.enum(TIER_KEYS),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    service: searchParams.get("service"),
    tier: searchParams.get("tier"),
    date: searchParams.get("date"),
  });

  if (!parsed.success) {
    return Response.json(
      { error: "VALIDATION" },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const slots = await getDaySlots({
    serviceKey: parsed.data.service,
    tierKey: parsed.data.tier,
    day: parsed.data.date,
  });

  return Response.json(slots, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
