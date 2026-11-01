import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "@/server/env";

/**
 * Thin client for the Shiprocket API (https://apiv2.shiprocket.in/v1/external).
 * Credentials are an API *user* created in Shiprocket → Settings → API → Configure
 * (not the panel login). Without SHIPROCKET_EMAIL + SHIPROCKET_PASSWORD the integration is off
 * and orders are shipped by hand exactly as before.
 */

export class ShiprocketError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ShiprocketError";
  }
}

export type ShiprocketStatus = {
  enabled: boolean;
  missing: string[];
  webhookTokenSet: boolean;
  pickupLocation: string;
};

export function shiprocketStatus(): ShiprocketStatus {
  const missing = [
    !env.SHIPROCKET_EMAIL && "SHIPROCKET_EMAIL",
    !env.SHIPROCKET_PASSWORD && "SHIPROCKET_PASSWORD",
  ].filter(Boolean) as string[];
  return {
    enabled: missing.length === 0,
    missing,
    webhookTokenSet: Boolean(env.SHIPROCKET_WEBHOOK_TOKEN),
    pickupLocation: env.SHIPROCKET_PICKUP_LOCATION ?? "Primary",
  };
}

const API_BASE = "https://apiv2.shiprocket.in/v1/external";

/** Public tracking page for an AWB on Shiprocket. */
export const trackingPageUrl = (awb: string): string =>
  `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;

/* ------------------------------- HTTP client ------------------------------- */

let tokenCache: { key: string; token: string; expires: number } | null = null;

async function rawCall<T>(
  method: "GET" | "POST",
  path: string,
  body: unknown,
  token: string | null,
): Promise<{ status: number; data: T | null }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new ShiprocketError("Could not reach Shiprocket. Try again in a minute.");
  }
  const text = await res.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    /* non-JSON error page */
  }
  return { status: res.status, data };
}

/** Shiprocket error bodies look like { message, errors: { field: [msg] } }; keep a short summary. */
function errorText(data: unknown, fallback: string): string {
  const d = data as { message?: unknown; errors?: Record<string, unknown> } | null;
  const parts: string[] = [];
  if (typeof d?.message === "string" && d.message.trim()) parts.push(d.message.trim());
  if (d?.errors && typeof d.errors === "object") {
    for (const [k, v] of Object.entries(d.errors).slice(0, 3)) {
      parts.push(`${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
    }
  }
  return (parts.join(" — ") || fallback).slice(0, 300);
}

async function token(force = false): Promise<string> {
  const email = env.SHIPROCKET_EMAIL;
  const password = env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new ShiprocketError("Shiprocket is not connected (set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD).");
  }
  const key = createHash("sha256").update(`${email}|${password}`).digest("hex");
  if (!force && tokenCache?.key === key && tokenCache.expires > Date.now()) return tokenCache.token;

  const { status, data } = await rawCall<{ token?: string }>("POST", "/auth/login", { email, password }, null);
  if (status === 401 || status === 403 || (status >= 400 && status < 500 && !data?.token)) {
    throw new ShiprocketError(
      "Shiprocket rejected the API login. Use the API user created under Settings → API, not your panel login.",
      status,
    );
  }
  if (!data?.token) throw new ShiprocketError(errorText(data, `Shiprocket login failed (${status}).`), status);
  // Tokens last 10 days; renew a day early.
  tokenCache = { key, token: data.token, expires: Date.now() + 9 * 24 * 3600_000 };
  return data.token;
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  let r = await rawCall<T>(method, path, body, await token());
  if (r.status === 401) r = await rawCall<T>(method, path, body, await token(true));
  if (r.status >= 400) throw new ShiprocketError(errorText(r.data, `Shiprocket error (${r.status}).`), r.status);
  return r.data as T;
}

/* --------------------------------- endpoints -------------------------------- */

export type CreateOrderResult = {
  order_id?: number | string;
  shipment_id?: number | string;
  awb_code?: string;
  courier_name?: string;
};

export const createAdhocOrder = (payload: unknown) =>
  call<CreateOrderResult>("POST", "/orders/create/adhoc", payload);

export type CourierOption = {
  courierId: number;
  name: string;
  rateInr: number;
  etd: string | null;
  etaDays: number | null;
  rating: number | null;
  codAvailable: boolean;
};

type ServiceabilityResponse = {
  data?: {
    available_courier_companies?: Array<{
      courier_company_id?: number;
      courier_name?: string;
      rate?: number;
      freight_charge?: number;
      etd?: string;
      estimated_delivery_days?: string | number;
      rating?: number;
      cod?: number;
    }>;
  };
};

/** Pickup pincode of the configured pickup location (looked up from the Shiprocket account). */
export async function pickupPincode(location: string): Promise<string | null> {
  const r = await call<{
    data?: { shipping_address?: Array<{ pickup_location?: string; pin_code?: string | number }> };
  }>("GET", "/settings/company/pickup");
  const list = r?.data?.shipping_address ?? [];
  const hit =
    list.find((a) => a.pickup_location?.toLowerCase() === location.toLowerCase()) ?? list[0];
  return hit?.pin_code != null ? String(hit.pin_code) : null;
}

/** Couriers that can deliver to a pincode, with price and ETA, cheapest first. */
export async function courierOptions(opts: {
  pickupPin: string;
  deliveryPin: string;
  weightKg: number;
  cod: boolean;
  declaredValueInr: number;
}): Promise<CourierOption[]> {
  const qs = new URLSearchParams({
    pickup_postcode: opts.pickupPin,
    delivery_postcode: opts.deliveryPin,
    weight: String(opts.weightKg),
    cod: opts.cod ? "1" : "0",
    declared_value: String(opts.declaredValueInr),
  });
  const r = await call<ServiceabilityResponse>("GET", `/courier/serviceability/?${qs.toString()}`);
  const list = r?.data?.available_courier_companies ?? [];
  return list
    .filter((c) => c.courier_company_id != null && c.courier_name)
    .map((c) => ({
      courierId: Number(c.courier_company_id),
      name: String(c.courier_name),
      rateInr: Math.round(Number(c.rate ?? c.freight_charge ?? 0)),
      etd: c.etd ?? null,
      etaDays: c.estimated_delivery_days != null ? Number(c.estimated_delivery_days) || null : null,
      rating: c.rating != null ? Number(c.rating) : null,
      codAvailable: c.cod === 1,
    }))
    .sort((a, b) => a.rateInr - b.rateInr);
}

export type AwbResult = {
  awb_assign_status?: number;
  response?: { data?: { awb_code?: string; courier_name?: string; awb_assign_error?: string } };
  message?: string;
};

export const assignAwb = (shipmentId: string, courierId?: number) =>
  call<AwbResult>("POST", "/courier/assign/awb", {
    shipment_id: shipmentId,
    ...(courierId ? { courier_id: courierId } : {}),
  });

export const schedulePickup = (shipmentId: string) =>
  call<unknown>("POST", "/courier/generate/pickup", { shipment_id: [shipmentId] });

export const generateLabel = (shipmentId: string) =>
  call<{ label_url?: string; response?: string }>("POST", "/courier/generate/label", {
    shipment_id: [shipmentId],
  });

export const cancelOrder = (providerOrderId: string) =>
  call<unknown>("POST", "/orders/cancel", { ids: [Number(providerOrderId) || providerOrderId] });

export const cancelAwb = (awb: string) =>
  call<unknown>("POST", "/orders/cancel/shipment/awbs", { awbs: [awb] });

export type TrackingActivity = { date: string; status: string; activity: string; location: string };
export type TrackingSnapshot = {
  status: string | null;
  etd: string | null;
  courier: string | null;
  activities: TrackingActivity[];
};

export async function trackAwb(awb: string): Promise<TrackingSnapshot> {
  const r = await call<{
    tracking_data?: {
      shipment_status?: number;
      etd?: string;
      shipment_track?: Array<{ current_status?: string; courier_name?: string }>;
      shipment_track_activities?: Array<{
        date?: string;
        status?: string;
        activity?: string;
        location?: string;
      }>;
    };
  }>("GET", `/courier/track/awb/${encodeURIComponent(awb)}`);
  const td = r?.tracking_data;
  const track = td?.shipment_track?.[0];
  return {
    status: track?.current_status ?? td?.shipment_track_activities?.[0]?.status ?? null,
    etd: td?.etd ?? null,
    courier: track?.courier_name ?? null,
    activities: (td?.shipment_track_activities ?? []).map((a) => ({
      date: a.date ?? "",
      status: a.status ?? "",
      activity: a.activity ?? "",
      location: a.location ?? "",
    })),
  };
}

/* ------------------------------ webhook security ----------------------------- */

/** Constant-time check of the token Shiprocket sends in the `x-api-key` header. */
export function webhookTokenValid(provided: string | null): boolean {
  const expected = env.SHIPROCKET_WEBHOOK_TOKEN;
  if (!expected || !provided) return false;
  const a = createHash("sha256").update(provided.trim()).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
