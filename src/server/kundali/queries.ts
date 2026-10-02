import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { kundaliOrders } from "@/server/db/schema/consult";
import { safeEqualHex, sha256Hex } from "@/server/ids";
import type { ChartSnapshot } from "@/lib/domain/kundali";
import type { KundaliStatus, Locale } from "@/lib/domain/enums";

export type KundaliReportView = {
  id: number;
  ref: string;
  name: string;
  dob: string;
  tob: string | null;
  tobUnknown: boolean;
  place: string;
  lat: number;
  lon: number;
  tz: string;
  phone: string;
  email: string | null;
  priceInr: number;
  status: KundaliStatus;
  reportLang: Locale;
  locale: Locale;
  chart: ChartSnapshot | null;
  pdfMediaId: number | null;
  createdAt: Date;
  paidAt: Date | null;
};

export type KundaliListItem = {
  id: number;
  ref: string;
  name: string;
  dob: string;
  place: string;
  reportLang: Locale;
  status: KundaliStatus;
  pdfMediaId: number | null;
  createdAt: Date;
  paidAt: Date | null;
};

export async function getKundaliReportView(
  ref: string,
  k?: string,
  userId?: number | null,
): Promise<KundaliReportView | null> {
  const [order] = await db
    .select()
    .from(kundaliOrders)
    .where(eq(kundaliOrders.ref, ref))
    .limit(1);

  if (!order) return null;

  let isAuthorized = false;
  if (k && safeEqualHex(sha256Hex(k), order.accessHash)) {
    isAuthorized = true;
  } else if (userId && order.userId === userId) {
    isAuthorized = true;
  }

  if (!isAuthorized) return null;

  return {
    id: order.id,
    ref: order.ref,
    name: order.name,
    dob: order.dob,
    tob: order.tob,
    tobUnknown: Boolean(order.tobUnknown),
    place: order.place,
    lat: order.lat,
    lon: order.lon,
    tz: order.tz,
    phone: order.phone,
    email: order.email,
    priceInr: order.priceInr,
    status: order.status,
    reportLang: order.reportLang,
    locale: order.locale,
    chart: order.chart,
    pdfMediaId: order.pdfMediaId,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
  };
}

export async function listMyKundaliOrders(
  userId: number,
): Promise<KundaliListItem[]> {
  const rows = await db
    .select({
      id: kundaliOrders.id,
      ref: kundaliOrders.ref,
      name: kundaliOrders.name,
      dob: kundaliOrders.dob,
      place: kundaliOrders.place,
      reportLang: kundaliOrders.reportLang,
      status: kundaliOrders.status,
      pdfMediaId: kundaliOrders.pdfMediaId,
      createdAt: kundaliOrders.createdAt,
      paidAt: kundaliOrders.paidAt,
    })
    .from(kundaliOrders)
    .where(eq(kundaliOrders.userId, userId))
    .orderBy(desc(kundaliOrders.createdAt));

  return rows.map((r) => ({
    ...r,
    tobUnknown: false,
  }));
}
