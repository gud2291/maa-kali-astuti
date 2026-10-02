import "server-only";
import { cached } from "@/server/cache";
import { istDayKey, addDaysKey } from "@/lib/core/ist";
import type { StoreSettings } from "@/lib/validation/settings";

type IndiaPostOffice = {
  District?: string;
  State?: string;
  Name?: string;
};

type IndiaPostResponse = {
  Status: string;
  Message?: string;
  PostOffice?: IndiaPostOffice[] | null;
};

async function fetchIndiaPostPincode(pin: string): Promise<{ city: string; state: string }> {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`India Post API HTTP ${res.status}`);
  }

  const data = (await res.json()) as IndiaPostResponse[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Empty response for pincode ${pin}`);
  }

  const block = data[0];
  if (block.Status !== "Success" || !block.PostOffice || block.PostOffice.length === 0) {
    throw new Error(block.Message || `No post office found for pincode ${pin}`);
  }

  const po = block.PostOffice[0];
  const city = po.District || po.Name || "";
  const state = po.State || "";

  if (!city && !state) {
    throw new Error(`Invalid location data for pincode ${pin}`);
  }

  return { city, state };
}

export const lookupPincode: (pin: string) => Promise<{ city: string; state: string }> = cached(
  "pincode",
  fetchIndiaPostPincode,
  () => [],
);

export function deliveryEstimate(
  store: StoreSettings,
  now: Date | number = Date.now(),
): { standard: [string, string]; express: [string, string] | null } {
  const baseKey = istDayKey(now);
  const standard: [string, string] = [
    addDaysKey(baseKey, store.standardDays[0]),
    addDaysKey(baseKey, store.standardDays[1]),
  ];

  const hasExpress =
    store.expressInr > 0 &&
    store.expressDays != null &&
    store.expressDays[0] > 0 &&
    store.expressDays[1] >= store.expressDays[0];

  const express: [string, string] | null = hasExpress
    ? [addDaysKey(baseKey, store.expressDays[0]), addDaysKey(baseKey, store.expressDays[1])]
    : null;

  return { standard, express };
}
