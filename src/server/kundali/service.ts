import "server-only";

import { and, eq, inArray, lt, or, sql } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/server/db/client";
import { kundaliOrders } from "@/server/db/schema/consult";
import { payments } from "@/server/db/schema/commerce";
import { media } from "@/server/db/schema/core";
import { getSetting } from "@/server/settings/queries";
import { accessKeyFor, hmacHex, refCode, sha256Hex } from "@/server/ids";
import { computeChart } from "@/server/kundali/engine";
import { buildReportModel } from "@/server/kundali/report/model";
import { renderReportHtml } from "@/server/kundali/report/html";
import { renderPdf } from "@/server/kundali/pdf";
import { putObject } from "@/server/storage/r2";
import { env } from "@/server/env";
import { AppError } from "@/server/result";
import { log } from "@/server/log";
import { absoluteUrl } from "@/server/request";
import { alertKundaliGenerationFailed, sendKundaliReady } from "./emails";
import type { KundaliOrderInput } from "@/lib/validation/kundali";

/**
 * Creates a pending Kundali order with computed chart snapshot.
 */
export async function createKundaliOrder(
  input: KundaliOrderInput,
  ctx: { userId: number | null },
): Promise<{
  id: number;
  ref: string;
  accessKey: string;
  priceInr: number;
}> {
  const settings = await getSetting("kundali");
  if (!settings.enabled) {
    throw new AppError("NOT_CONFIGURED", "Kundali orders are temporarily unavailable");
  }

  const chart = computeChart({
    name: input.name,
    dob: input.dob,
    tob: input.tob,
    tobUnknown: input.tobUnknown,
    place: input.place.name,
    lat: input.place.lat,
    lon: input.place.lon,
    tz: input.place.tz,
  });

  let chosenRef = "";
  let chosenAccessKey = "";
  let orderId = 0;

  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = refCode("MKA-K", 6);
    const accessKey = accessKeyFor("kundali", ref);
    const accessHash = sha256Hex(accessKey);

    try {
      const [inserted] = await db
        .insert(kundaliOrders)
        .values({
          ref,
          accessHash,
          userId: ctx.userId,
          locale: input.locale,
          reportLang: input.reportLang,
          name: input.name,
          dob: input.dob,
          tob: input.tob,
          tobUnknown: input.tobUnknown,
          place: input.place.name,
          lat: input.place.lat,
          lon: input.place.lon,
          tz: input.place.tz,
          phone: input.phone,
          email: input.email ?? null,
          priceInr: settings.priceInr,
          status: "pending_payment",
          chart,
        })
        .returning({ id: kundaliOrders.id });

      if (inserted) {
        orderId = inserted.id;
        chosenRef = ref;
        chosenAccessKey = accessKey;
        break;
      }
    } catch (err) {
      log.warn("kundali.ref_collision", { ref, attempt });
    }
  }

  if (!orderId) {
    throw new AppError("INTERNAL", "Could not generate a unique Kundali order reference");
  }

  return {
    id: orderId,
    ref: chosenRef,
    accessKey: chosenAccessKey,
    priceInr: settings.priceInr,
  };
}

/**
 * Marks a Kundali order as paid (idempotent, first-time update pattern)
 * and triggers report generation in after().
 */
export async function markKundaliPaid(opts: {
  kundaliId: number;
  rzpOrderId: string | null;
  rzpPaymentId: string;
  amountInr: number;
  method?: string | null;
}): Promise<{ first: boolean; kundaliId: number }> {
  const [order] = await db
    .select()
    .from(kundaliOrders)
    .where(eq(kundaliOrders.id, opts.kundaliId))
    .limit(1);

  if (!order) {
    throw new AppError("NOT_FOUND", "Kundali order not found");
  }

  if (order.status !== "pending_payment") {
    return { first: false, kundaliId: order.id };
  }

  const now = new Date();

  const [updated] = await db
    .update(kundaliOrders)
    .set({
      status: "paid",
      paidAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(kundaliOrders.id, opts.kundaliId),
        eq(kundaliOrders.status, "pending_payment"),
      ),
    )
    .returning({ id: kundaliOrders.id, ref: kundaliOrders.ref });

  if (!updated) {
    return { first: false, kundaliId: order.id };
  }

  await db.insert(payments).values({
    entity: "kundali",
    entityId: order.id,
    provider: "razorpay",
    rzpOrderId: opts.rzpOrderId,
    rzpPaymentId: opts.rzpPaymentId,
    amountInr: opts.amountInr,
    status: "captured",
    method: opts.method ?? null,
  });

  after(async () => {
    try {
      const genUrl = absoluteUrl(`/api/kundali/${updated.ref}/generate`);
      await fetch(genUrl, {
        method: "POST",
        headers: {
          "x-internal-key": hmacHex("gen:" + updated.ref),
        },
        signal: AbortSignal.timeout(2000),
      }).catch(() => {});
    } catch (err) {
      log.error("kundali.trigger_generation_failed", { orderId: updated.id, err });
    }
  });

  return { first: true, kundaliId: order.id };
}

/**
 * Locks the order and generates the 28-page PDF report.
 */
export async function generateKundaliReport(
  id: number,
): Promise<{ status: string }> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 120_000);

  const [locked] = await db
    .update(kundaliOrders)
    .set({
      status: "generating",
      genStartedAt: now,
      genAttempts: sql`${kundaliOrders.genAttempts} + 1`,
      updatedAt: now,
    })
    .where(
      and(
        eq(kundaliOrders.id, id),
        lt(kundaliOrders.genAttempts, 5),
        or(
          inArray(kundaliOrders.status, ["paid", "failed"]),
          and(
            eq(kundaliOrders.status, "generating"),
            lt(kundaliOrders.genStartedAt, cutoff),
          ),
        ),
      ),
    )
    .returning();

  if (!locked) {
    const [current] = await db
      .select({ status: kundaliOrders.status })
      .from(kundaliOrders)
      .where(eq(kundaliOrders.id, id))
      .limit(1);
    return { status: current?.status ?? "not_found" };
  }

  try {
    let chart = locked.chart;
    if (!chart) {
      chart = computeChart({
        name: locked.name,
        dob: locked.dob,
        tob: locked.tob,
        tobUnknown: locked.tobUnknown,
        place: locked.place,
        lat: locked.lat,
        lon: locked.lon,
        tz: locked.tz,
      });
    }

    const model = buildReportModel({
      chart,
      lang: locked.reportLang,
      name: locked.name,
      place: locked.place,
      generatedAt: now,
    });

    const html = await renderReportHtml(model);
    const pdfBuffer = await renderPdf(html);

    const yyyy = now.getUTCFullYear().toString();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const key = `prv/kundali/${yyyy}/${mm}/${locked.ref}.pdf`;

    if (!env.R2_BUCKET_PRIVATE) {
      throw new AppError("NOT_CONFIGURED", "R2 private bucket is not configured");
    }

    await putObject(env.R2_BUCKET_PRIVATE, key, pdfBuffer, "application/pdf");

    const [mediaRow] = await db
      .insert(media)
      .values({
        kind: "pdf",
        bucket: "private",
        purpose: "kundali",
        status: "ready",
        variants: [{ w: 0, h: 0, key, bytes: pdfBuffer.byteLength }],
        mime: "application/pdf",
        altEn: `Kundali Report — ${locked.name}`,
        altHi: `जन्मपत्री प्रतिवेदन — ${locked.name}`,
        ownerType: "kundali",
        ownerId: String(locked.id),
      })
      .returning({ id: media.id });

    await db
      .update(kundaliOrders)
      .set({
        status: "ready",
        pdfMediaId: mediaRow.id,
        error: null,
        updatedAt: new Date(),
      })
      .where(eq(kundaliOrders.id, locked.id));

    after(async () => {
      try {
        await sendKundaliReady(locked.id, pdfBuffer);
      } catch (err) {
        log.error("kundali.after_email_failed", { orderId: locked.id, err });
      }
    });

    return { status: "ready" };
  } catch (err) {
    const shortError = (err instanceof Error ? err.message : String(err)).slice(0, 500);
    log.error("kundali.generate_report_failed", {
      id: locked.id,
      ref: locked.ref,
      error: shortError,
    });

    await db
      .update(kundaliOrders)
      .set({
        status: "failed",
        error: shortError,
        updatedAt: new Date(),
      })
      .where(eq(kundaliOrders.id, locked.id));

    // locked.genAttempts after sql`genAttempts + 1` was incremented
    const attempts = (locked.genAttempts ?? 0) + 1;
    if (attempts >= 5) {
      after(async () => {
        try {
          await alertKundaliGenerationFailed(locked.id, shortError);
        } catch (e) {
          log.error("kundali.alert_admin_failed", e);
        }
      });
    }

    return { status: "failed" };
  }
}
