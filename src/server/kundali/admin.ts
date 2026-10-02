import "server-only";

import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/server/db/client";
import { kundaliOrders } from "@/server/db/schema/consult";
import { payments } from "@/server/db/schema/commerce";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import { generateKundaliReport } from "./service";
import { sendKundaliReady } from "./emails";
import type { ChartSnapshot } from "@/lib/domain/kundali";
import type { KundaliStatus, Locale } from "@/lib/domain/enums";

export type KundaliAdminListItem = {
  id: number;
  ref: string;
  name: string;
  dob: string;
  tob: string | null;
  tobUnknown: boolean;
  place: string;
  phone: string;
  email: string | null;
  reportLang: Locale;
  priceInr: number;
  status: KundaliStatus;
  genAttempts: number;
  error: string | null;
  createdAt: Date;
  paidAt: Date | null;
};

export type ListKundaliOrdersResult = {
  items: KundaliAdminListItem[];
  total: number;
  totalPages: number;
  page: number;
};

export type KundaliOrderDetailAdmin = KundaliAdminListItem & {
  lat: number;
  lon: number;
  tz: string;
  locale: Locale;
  chart: ChartSnapshot | null;
  pdfMediaId: number | null;
  razorpayOrderId: string | null;
  emailedAt: Date | null;
  payment: {
    rzpPaymentId: string;
    amountInr: number;
    status: string;
    method: string | null;
    createdAt: Date;
  } | null;
};

export async function listKundaliOrders(params: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<ListKundaliOrdersResult> {
  await requireAdmin("kundali.view");

  const pageSize = 20;
  const page = Math.max(1, params.page ?? 1);
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (params.status && params.status !== "all") {
    conditions.push(eq(kundaliOrders.status, params.status as KundaliStatus));
  }

  if (params.search && params.search.trim()) {
    const q = `%${params.search.trim()}%`;
    conditions.push(
      or(
        like(kundaliOrders.ref, q),
        like(kundaliOrders.name, q),
        like(kundaliOrders.phone, q),
        like(kundaliOrders.email, q),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRes] = await db
    .select({ count: count() })
    .from(kundaliOrders)
    .where(whereClause);

  const total = totalRes?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const rows = await db
    .select({
      id: kundaliOrders.id,
      ref: kundaliOrders.ref,
      name: kundaliOrders.name,
      dob: kundaliOrders.dob,
      tob: kundaliOrders.tob,
      tobUnknown: kundaliOrders.tobUnknown,
      place: kundaliOrders.place,
      phone: kundaliOrders.phone,
      email: kundaliOrders.email,
      reportLang: kundaliOrders.reportLang,
      priceInr: kundaliOrders.priceInr,
      status: kundaliOrders.status,
      genAttempts: kundaliOrders.genAttempts,
      error: kundaliOrders.error,
      createdAt: kundaliOrders.createdAt,
      paidAt: kundaliOrders.paidAt,
    })
    .from(kundaliOrders)
    .where(whereClause)
    .orderBy(desc(kundaliOrders.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    items: rows.map((r) => ({
      ...r,
      tobUnknown: Boolean(r.tobUnknown),
    })),
    total,
    totalPages,
    page,
  };
}

export async function getKundaliOrderAdmin(
  id: number,
): Promise<KundaliOrderDetailAdmin> {
  await requireAdmin("kundali.view");

  const [order] = await db
    .select()
    .from(kundaliOrders)
    .where(eq(kundaliOrders.id, id))
    .limit(1);

  if (!order) {
    throw new AppError("NOT_FOUND", "Kundali order not found");
  }

  const [pay] = await db
    .select({
      rzpPaymentId: payments.rzpPaymentId,
      amountInr: payments.amountInr,
      status: payments.status,
      method: payments.method,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(and(eq(payments.entity, "kundali"), eq(payments.entityId, id)))
    .limit(1);

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
    locale: order.locale,
    reportLang: order.reportLang,
    priceInr: order.priceInr,
    status: order.status,
    chart: order.chart,
    pdfMediaId: order.pdfMediaId,
    genAttempts: order.genAttempts,
    error: order.error,
    razorpayOrderId: order.razorpayOrderId,
    emailedAt: order.emailedAt,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    payment: pay ? {
      rzpPaymentId: pay.rzpPaymentId ?? "",
      amountInr: pay.amountInr,
      status: pay.status,
      method: pay.method,
      createdAt: pay.createdAt,
    } : null,
  };
}

export async function regenerate(
  id: number,
): Promise<{ status: string }> {
  const admin = await requireAdmin("kundali.update");

  await db
    .update(kundaliOrders)
    .set({
      genAttempts: 0,
      status: "paid",
      error: null,
      updatedAt: new Date(),
    })
    .where(eq(kundaliOrders.id, id));

  await audit({
    actorId: admin.id,
    action: "kundali.regenerate",
    entity: "kundali",
    entityId: id,
    summary: `Regenerate Kundali report #${id}`,
  });

  return await generateKundaliReport(id);
}

export async function resendEmail(
  id: number,
): Promise<{ ok: true }> {
  const admin = await requireAdmin("kundali.update");

  await sendKundaliReady(id);

  await audit({
    actorId: admin.id,
    action: "kundali.resend_email",
    entity: "kundali",
    entityId: id,
    summary: `Resend Kundali report ready email #${id}`,
  });

  return { ok: true };
}
