import { NextResponse, type NextRequest } from "next/server";
import { istDayKey, addDaysKey } from "@/lib/core/ist";
import { uiPeriodToQuery } from "@/server/rashifal/periods";
import { getRashifal } from "@/server/rashifal/queries";
import type { Period as UiPeriod } from "@/lib/astro/predict";

const VALID_PERIODS = new Set<UiPeriod>([
  "today",
  "tomorrow",
  "week",
  "month",
  "year",
]);
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const pParam = req.nextUrl.searchParams.get("p") as UiPeriod | null;
  const p: UiPeriod = pParam && VALID_PERIODS.has(pParam) ? pParam : "today";

  const dParam = req.nextUrl.searchParams.get("d")?.trim() ?? "";
  const serverToday = istDayKey(Date.now());
  const minDay = addDaysKey(serverToday, -2);
  const maxDay = addDaysKey(serverToday, 2);

  const d =
    DATE_REGEX.test(dParam) && dParam >= minDay && dParam <= maxDay
      ? dParam
      : serverToday;

  const { period, startsOn } = uiPeriodToQuery(p, d);
  const entries = await getRashifal(period, startsOn);

  return NextResponse.json(
    { period, startsOn, entries },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    },
  );
}
