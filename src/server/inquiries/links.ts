import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { inquiries, inquiryEvents, paymentLinks } from "@/server/db/schema/crm";
import { payments } from "@/server/db/schema/commerce";
import { requireAdmin, type AdminUser } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { createPaymentLink } from "@/server/payments/razorpay";
import { AppError } from "@/server/result";
import { log } from "@/server/log";

export type PaymentLinkRow = typeof paymentLinks.$inferSelect;

export async function createInquiryLink(
  inquiryId: number,
  opts: { amountInr: number; purpose: string },
  actor?: AdminUser | null,
): Promise<PaymentLinkRow> {
  const admin = actor ?? (await requireAdmin("payment_links.create"));

  const [inquiry] = await db
    .select()
    .from(inquiries)
    .where(eq(inquiries.id, inquiryId))
    .limit(1);

  if (!inquiry) {
    throw new AppError("NOT_FOUND", "Inquiry not found");
  }

  const rzp = await createPaymentLink({
    amountInr: opts.amountInr,
    description: opts.purpose,
    customer: {
      name: inquiry.name,
      contact: inquiry.phone,
      email: inquiry.email || undefined,
    },
    notes: {
      entity: "link",
      entityId: String(inquiryId),
    },
  });

  const [link] = await db
    .insert(paymentLinks)
    .values({
      rzpLinkId: rzp.id,
      entity: "inquiry",
      entityId: inquiryId,
      amountInr: opts.amountInr,
      purpose: opts.purpose,
      shortUrl: rzp.short_url,
      status: "created",
      customer: {
        name: inquiry.name,
        phone: inquiry.phone,
        email: inquiry.email,
      },
      createdBy: admin.id,
      paidAt: null,
    })
    .returning();

  await db.insert(inquiryEvents).values({
    inquiryId,
    type: "payment_link",
    message: `Payment link created for ₹${opts.amountInr} (${opts.purpose}) — ${rzp.short_url}`,
    actorId: admin.id,
  });

  await audit({
    actorId: admin.id,
    action: "payment_links.create",
    entity: "payment_link",
    entityId: link.id,
    summary: `Created payment link for ₹${opts.amountInr} (${opts.purpose}) for inquiry #${inquiryId}`,
  });

  return link;
}

export async function createCustomLink(
  opts: {
    amountInr: number;
    purpose: string;
    customer: { name: string; phone: string; email: string | null };
  },
  actor?: AdminUser | null,
): Promise<PaymentLinkRow> {
  const admin = actor ?? (await requireAdmin("payment_links.create"));

  const rzp = await createPaymentLink({
    amountInr: opts.amountInr,
    description: opts.purpose,
    customer: {
      name: opts.customer.name,
      contact: opts.customer.phone,
      email: opts.customer.email || undefined,
    },
    notes: {
      entity: "link",
    },
  });

  const [link] = await db
    .insert(paymentLinks)
    .values({
      rzpLinkId: rzp.id,
      entity: "custom",
      entityId: null,
      amountInr: opts.amountInr,
      purpose: opts.purpose,
      shortUrl: rzp.short_url,
      status: "created",
      customer: opts.customer,
      createdBy: admin.id,
      paidAt: null,
    })
    .returning();

  await audit({
    actorId: admin.id,
    action: "payment_links.create",
    entity: "payment_link",
    entityId: link.id,
    summary: `Created custom payment link for ₹${opts.amountInr} (${opts.purpose})`,
  });

  return link;
}

export async function markLinkPaid(opts: {
  rzpLinkId?: string;
  linkId?: number;
  rzpPaymentId: string;
  amountInr: number;
  method?: string | null;
}): Promise<{ ok: boolean; first: boolean }> {
  const whereClause = opts.rzpLinkId
    ? and(eq(paymentLinks.rzpLinkId, opts.rzpLinkId), eq(paymentLinks.status, "created"))
    : opts.linkId
      ? and(eq(paymentLinks.id, opts.linkId), eq(paymentLinks.status, "created"))
      : null;

  if (!whereClause) {
    log.warn("payment_link.mark_paid_missing_id", opts);
    return { ok: false, first: false };
  }

  const [updatedLink] = await db
    .update(paymentLinks)
    .set({
      status: "paid",
      paidAt: new Date(),
    })
    .where(whereClause)
    .returning();

  if (!updatedLink) {
    // Already marked paid or not found
    return { ok: true, first: false };
  }

  // Insert row into payments
  await db.insert(payments).values({
    entity: "link",
    entityId: updatedLink.id,
    provider: "razorpay",
    rzpOrderId: null,
    rzpPaymentId: opts.rzpPaymentId,
    amountInr: opts.amountInr,
    status: "captured",
    method: opts.method ?? null,
  });

  // If associated with an inquiry, update inquiry paid amount & event
  if (updatedLink.entity === "inquiry" && updatedLink.entityId) {
    await db
      .update(inquiries)
      .set({
        paidInr: sql`${inquiries.paidInr} + ${opts.amountInr}`,
      })
      .where(eq(inquiries.id, updatedLink.entityId));

    await db.insert(inquiryEvents).values({
      inquiryId: updatedLink.entityId,
      type: "payment",
      message: `Payment received: ₹${opts.amountInr} (Payment ID: ${opts.rzpPaymentId})`,
      actorId: null,
    });
  }

  log.info("payment_link.paid_success", {
    linkId: updatedLink.id,
    rzpLinkId: updatedLink.rzpLinkId,
    amountInr: opts.amountInr,
  });

  return { ok: true, first: true };
}
