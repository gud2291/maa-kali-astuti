import { NextResponse, type NextRequest } from "next/server";
import { searchPlaces } from "@/server/kundali/places";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 60) {
    return NextResponse.json([]);
  }

  const results = searchPlaces(q, 8);
  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
