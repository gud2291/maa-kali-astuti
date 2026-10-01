import { lookupPincode, deliveryEstimate } from "@/server/catalog/pincode";
import { getSetting } from "@/server/settings/queries";

type RouteProps = {
  params: Promise<{ pin: string }>;
};

const PIN_REGEX = /^[1-9]\d{5}$/;

export async function GET(_req: Request, { params }: RouteProps): Promise<Response> {
  const { pin } = await params;
  const trimmed = pin ? pin.trim() : "";

  if (!PIN_REGEX.test(trimmed)) {
    return Response.json(
      { error: "VALIDATION" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const store = await getSetting("store");
  const { standard, express } = deliveryEstimate(store);

  let city: string | null = null;
  let state: string | null = null;

  try {
    const loc = await lookupPincode(trimmed);
    city = loc.city;
    state = loc.state;
  } catch {
    city = null;
    state = null;
  }

  return Response.json(
    {
      pin: trimmed,
      city,
      state,
      cod: store.codEnabled,
      standard,
      express,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600",
      },
    },
  );
}
