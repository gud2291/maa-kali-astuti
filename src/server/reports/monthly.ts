import "server-only";
import { and, asc, eq, gte, inArray, isNotNull, lt, ne } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders, orderItems } from "@/server/db/schema/commerce";
import { getSetting } from "@/server/settings/queries";
import { buildInvoice } from "@/server/orders/invoice";
import { formatIst } from "@/lib/core/ist";
import { toCsv } from "@/server/csv";

export type SalesRow = {
  invoiceNo: string;
  date: string;
  orderNumber: string;
  customer: string;
  state: string;
  stateCode: string;
  paymentMethod: string;
  paymentStatus: string;
  itemsInr: number;
  feesInr: number;
  discountInr: number;
  taxableInr: number;
  cgstInr: number;
  sgstInr: number;
  igstInr: number;
  totalTaxInr: number;
  grandTotalInr: number;
  refundedInr: number;
};

export type RateRow = { gstRate: number; taxableInr: number; cgstInr: number; sgstInr: number; igstInr: number };

export type MonthlyReport = {
  month: string;
  isTaxInvoice: boolean;
  rows: SalesRow[];
  totals: Omit<SalesRow, "invoiceNo" | "date" | "orderNumber" | "customer" | "state" | "stateCode" | "paymentMethod" | "paymentStatus">;
  byRate: RateRow[];
  /** Cancelled orders in the month: they had an invoice number but are left out of the register. */
  cancelledCount: number;
};

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** [start, end) of an IST calendar month as UTC dates. */
export function monthRange(month: string): { start: Date; end: Date } {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  return {
    start: new Date(`${month}-01T00:00:00+05:30`),
    end: new Date(`${String(ny).padStart(4, "0")}-${String(nm).padStart(2, "0")}-01T00:00:00+05:30`),
  };
}

const r2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** Sales register for one month: every invoiced, non-cancelled order, with GST split exactly as on the invoice. */
export async function buildMonthlyReport(month: string): Promise<MonthlyReport> {
  if (!MONTH_RE.test(month)) throw new Error("Invalid month");
  const { start, end } = monthRange(month);
  const [invoiceSettings, contact] = await Promise.all([getSetting("invoice"), getSetting("contact")]);

  const base = and(isNotNull(orders.invoiceNo), gte(orders.placedAt, start), lt(orders.placedAt, end));
  const list = await db
    .select()
    .from(orders)
    .where(and(base, ne(orders.status, "cancelled")))
    .orderBy(asc(orders.placedAt), asc(orders.id))
    .limit(5000);
  const cancelled = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(base, eq(orders.status, "cancelled")));

  const items = list.length
    ? await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, list.map((o) => o.id)))
        .orderBy(asc(orderItems.id))
    : [];

  const rows: SalesRow[] = [];
  const rate = new Map<number, RateRow>();
  let isTax = false;
  for (const o of list) {
    const inv = buildInvoice(o, items.filter((i) => i.orderId === o.id), invoiceSettings, contact);
    isTax = inv.isTaxInvoice;
    rows.push({
      invoiceNo: inv.invoiceNo,
      date: formatIst(o.placedAt ?? o.createdAt),
      orderNumber: o.number,
      customer: o.name,
      state: inv.buyer.state,
      stateCode: inv.buyer.stateCode ?? "",
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      itemsInr: inv.totals.itemsInr,
      feesInr: inv.totals.feesInr,
      discountInr: inv.totals.discountInr,
      taxableInr: inv.totals.taxableInr,
      cgstInr: inv.totals.cgstInr,
      sgstInr: inv.totals.sgstInr,
      igstInr: inv.totals.igstInr,
      totalTaxInr: inv.totals.totalTaxInr,
      grandTotalInr: inv.totals.grandTotalInr,
      refundedInr: o.refundedInr,
    });
    for (const t of inv.taxSummary) {
      const cur = rate.get(t.rate) ?? { gstRate: t.rate, taxableInr: 0, cgstInr: 0, sgstInr: 0, igstInr: 0 };
      cur.taxableInr = r2(cur.taxableInr + t.taxableInr);
      cur.cgstInr = r2(cur.cgstInr + t.cgstInr);
      cur.sgstInr = r2(cur.sgstInr + t.sgstInr);
      cur.igstInr = r2(cur.igstInr + t.igstInr);
      rate.set(t.rate, cur);
    }
  }

  const sum = (k: keyof SalesRow): number => r2(rows.reduce((s, r) => s + (r[k] as number), 0));
  return {
    month,
    isTaxInvoice: isTax,
    rows,
    totals: {
      itemsInr: sum("itemsInr"),
      feesInr: sum("feesInr"),
      discountInr: sum("discountInr"),
      taxableInr: sum("taxableInr"),
      cgstInr: sum("cgstInr"),
      sgstInr: sum("sgstInr"),
      igstInr: sum("igstInr"),
      totalTaxInr: sum("totalTaxInr"),
      grandTotalInr: sum("grandTotalInr"),
      refundedInr: sum("refundedInr"),
    },
    byRate: [...rate.values()].sort((a, b) => a.gstRate - b.gstRate),
    cancelledCount: cancelled.length,
  };
}

/** CSV for the accountant: the register plus a totals row. */
export function reportToCsv(rep: MonthlyReport): string {
  const total: SalesRow = {
    ...rep.totals,
    invoiceNo: "TOTAL",
    date: "",
    orderNumber: `${rep.rows.length} orders`,
    customer: "",
    state: "",
    stateCode: "",
    paymentMethod: "",
    paymentStatus: "",
  };
  return toCsv<SalesRow>([...rep.rows, total], [
    { header: "Invoice No", value: (r) => r.invoiceNo },
    { header: "Date (IST)", value: (r) => r.date },
    { header: "Order No", value: (r) => r.orderNumber },
    { header: "Customer", value: (r) => r.customer },
    { header: "Place of supply", value: (r) => r.state },
    { header: "State code", value: (r) => r.stateCode },
    { header: "Payment method", value: (r) => r.paymentMethod },
    { header: "Payment status", value: (r) => r.paymentStatus },
    { header: "Items value", value: (r) => r.itemsInr },
    { header: "Shipping and fees", value: (r) => r.feesInr },
    { header: "Discount", value: (r) => r.discountInr },
    { header: "Taxable value", value: (r) => r.taxableInr },
    { header: "CGST", value: (r) => r.cgstInr },
    { header: "SGST", value: (r) => r.sgstInr },
    { header: "IGST", value: (r) => r.igstInr },
    { header: "Total GST", value: (r) => r.totalTaxInr },
    { header: "Invoice total", value: (r) => r.grandTotalInr },
    { header: "Refunded", value: (r) => r.refundedInr },
  ]);
}
