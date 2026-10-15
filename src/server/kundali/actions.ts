"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { runAction, type ActionResult, AppError } from "@/server/result";
import { clientIp } from "@/server/request";
import { rateLimit } from "@/server/rate-limit";
import { chartInputSchema, kundaliOrderSchema } from "@/lib/validation/kundali";
import { computeChart } from "@/server/kundali/engine";
import type { ChartSnapshot } from "@/lib/domain/kundali";
import { createKundaliOrder } from "./service";
import { getCustomer } from "@/server/auth/guards";
import { safeEqualHex, sha256Hex } from "@/server/ids";
import { signedPrivateUrl } from "@/server/media/service";
import { db } from "@/server/db/client";
import { kundaliOrders } from "@/server/db/schema/consult";

export async function computeChartAction(
  input: unknown,
): Promise<ActionResult<ChartSnapshot>> {
  return runAction(async () => {
    const data = chartInputSchema.parse(input);

    const ip = await clientIp();
    await rateLimit("chart:ip", ip, 30, 3600);

    return computeChart({
      name: data.name,
      dob: data.dob,
      tob: data.tob,
      tobUnknown: data.tobUnknown,
      place: data.place.name,
      lat: data.place.lat,
      lon: data.place.lon,
      tz: data.place.tz,
    });
  });
}

export type CreateKundaliOrderResult = {
  ref: string;
  accessKey: string;
};

/** The full report is free: creates the order and starts PDF generation (no payment step). */
export async function createKundaliOrderAction(
  input: unknown,
): Promise<ActionResult<CreateKundaliOrderResult>> {
  return runAction(async () => {
    const data = kundaliOrderSchema.parse(input);

    const ip = await clientIp();
    await rateLimit("k99:ip", ip, 10, 600);
    // The report is free: at most 3 reports per phone number per day.
    await rateLimit("k99:phone", data.phone, 3, 86400);

    const customer = await getCustomer();
    const order = await createKundaliOrder(data, {
      userId: customer?.id ?? null,
    });

    return {
      ref: order.ref,
      accessKey: order.accessKey,
    };
  });
}

const statusInputSchema = z.object({
  ref: z.string().trim().min(1),
  k: z.string().trim().min(1),
});

export type KundaliStatusResult = {
  status: string;
  pdfUrl?: string;
};

export async function kundaliStatusAction(
  input: unknown,
): Promise<ActionResult<KundaliStatusResult>> {
  return runAction(async () => {
    const data = statusInputSchema.parse(input);

    const [order] = await db
      .select()
      .from(kundaliOrders)
      .where(eq(kundaliOrders.ref, data.ref))
      .limit(1);

    if (!order) {
      throw new AppError("NOT_FOUND", "Kundali order not found");
    }

    const accessValid = safeEqualHex(sha256Hex(data.k), order.accessHash);
    if (!accessValid) {
      const customer = await getCustomer();
      if (!customer || customer.id !== order.userId) {
        throw new AppError("UNAUTHENTICATED", "Invalid access key");
      }
    }

    let pdfUrl: string | undefined = undefined;
    if (order.status === "ready" && order.pdfMediaId) {
      try {
        const safeFilename = `Janam-Kundali-${order.name.trim().replace(/\s+/g, "-")}.pdf`;
        pdfUrl = await signedPrivateUrl(order.pdfMediaId, safeFilename);
      } catch {
        // presign failed
      }
    }

    return {
      status: order.status,
      pdfUrl,
    };
  });
}

const pdfLinkInputSchema = z.object({
  ref: z.string().trim().min(1),
  k: z.string().trim().optional(),
});

export async function kundaliPdfLinkAction(
  input: unknown,
): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const data = pdfLinkInputSchema.parse(input);

    const [order] = await db
      .select()
      .from(kundaliOrders)
      .where(eq(kundaliOrders.ref, data.ref))
      .limit(1);

    if (!order) {
      throw new AppError("NOT_FOUND", "Kundali order not found");
    }

    let isAuthorized = false;
    if (data.k && safeEqualHex(sha256Hex(data.k), order.accessHash)) {
      isAuthorized = true;
    } else {
      const customer = await getCustomer();
      if (customer && customer.id === order.userId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new AppError("UNAUTHENTICATED", "Unauthorized to view this report");
    }

    if (order.status !== "ready" || !order.pdfMediaId) {
      throw new AppError("VALIDATION", "Report is not ready yet");
    }

    const safeFilename = `Janam-Kundali-${order.name.trim().replace(/\s+/g, "-")}.pdf`;
    const url = await signedPrivateUrl(order.pdfMediaId, safeFilename);

    return { url };
  });
}
