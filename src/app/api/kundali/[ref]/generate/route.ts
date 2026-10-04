import { type NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { kundaliOrders } from "@/server/db/schema/consult";
import { hmacHex, safeEqualHex, sha256Hex } from "@/server/ids";
import { generateKundaliReport } from "@/server/kundali/service";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
): Promise<NextResponse> {
  const { ref } = await params;

  const [order] = await db
    .select()
    .from(kundaliOrders)
    .where(eq(kundaliOrders.ref, ref))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Check authentication
  const internalKey = req.headers.get("x-internal-key");
  const expectedInternal = hmacHex("gen:" + ref);

  let isAuthorized = false;
  if (internalKey && safeEqualHex(internalKey, expectedInternal)) {
    isAuthorized = true;
  } else {
    try {
      const body = (await req.json()) as { k?: string };
      if (body?.k && safeEqualHex(sha256Hex(body.k), order.accessHash)) {
        isAuthorized = true;
      }
    } catch {
      // Body parsing failed or empty
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const res = await generateKundaliReport(order.id);
  return NextResponse.json({ status: res.status });
}
