import { buildSnapshot } from "@/server/catalog/snapshot";

export async function GET(): Promise<Response> {
  const snapshot = await buildSnapshot();
  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
    },
  });
}
