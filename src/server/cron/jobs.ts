import "server-only";
import { createElement } from "react";
import { and, eq, gte, inArray, isNull, lt, lte, ne, or, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  orders,
  orderItems,
  orderEvents,
  checkoutDrafts,
} from "@/server/db/schema/commerce";
import { bookings, kundaliOrders } from "@/server/db/schema/consult";
import {
  sessions,
  otpCodes,
  rateLimits,
  webhookEvents,
  media,
} from "@/server/db/schema/core";
import { products } from "@/server/db/schema/catalog";
import { getSetting } from "@/server/settings/queries";
import { getConsultRows } from "@/server/consult/queries";
import { accessKeyFor, hmacHex } from "@/server/ids";
import { absoluteUrl } from "@/server/request";
import { sendEmail } from "@/server/email/send";
import { deleteMedia } from "@/server/media/service";
import { log } from "@/server/log";
import { istDayKey, addDaysKey, istWallToUtc, formatIst } from "@/lib/core/ist";
import type { Locale } from "@/lib/domain/enums";
import {
  BookingReminderEmail,
  getBookingReminderSubject,
} from "@/server/email/templates/BookingReminderEmail";
import {
  ReviewRequestEmail,
  getReviewRequestSubject,
} from "@/server/email/templates/ReviewRequestEmail";
import {
  AbandonedCheckoutEmail,
  getAbandonedCheckoutSubject,
} from "@/server/email/templates/AbandonedCheckoutEmail";
import {
  AdminDigestEmail,
  getAdminDigestSubject,
} from "@/server/email/templates/AdminDigestEmail";

/**
 * 1. Expire online unpaid orders after 24 hours.
 */
export async function expireUnpaidOrders(now: Date): Promise<{ done: number }> {
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const rows = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.status, "pending_payment"),
        lt(orders.createdAt, cutoff),
      ),
    )
    .limit(100);

  if (rows.length === 0) return { done: 0 };

  let count = 0;
  for (const row of rows) {
    const res = await db
      .update(orders)
      .set({
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      })
      .where(and(eq(orders.id, row.id), eq(orders.status, "pending_payment")))
      .returning({ id: orders.id });

    if (res.length > 0) {
      await db.insert(orderEvents).values({
        orderId: row.id,
        type: "cancelled",
        fromStatus: "pending_payment",
        toStatus: "cancelled",
        message: "Order expired due to unpaid online payment (> 24 hours)",
        public: true,
      });
      count++;
    }
  }

  return { done: count };
}

/**
 * 2. Expire booking holds when hold expired > 1 hour ago.
 */
export async function expireBookingHolds(now: Date): Promise<{ done: number }> {
  const cutoff = new Date(now.getTime() - 60 * 60 * 1000);
  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "pending_payment"),
        lt(bookings.holdExpiresAt, cutoff),
      ),
    )
    .limit(100);

  if (rows.length === 0) return { done: 0 };

  const ids = rows.map((r) => r.id);
  const updated = await db
    .update(bookings)
    .set({
      status: "expired",
      updatedAt: now,
    })
    .where(inArray(bookings.id, ids))
    .returning({ id: bookings.id });

  return { done: updated.length };
}

/**
 * 3. Booking day reminders: confirmed bookings scheduled tomorrow IST.
 */
export async function bookingDayReminders(now: Date): Promise<{ done: number }> {
  const todayKey = istDayKey(now);
  const tomorrowKey = addDaysKey(todayKey, 1);
  const startTomorrow = istWallToUtc(tomorrowKey, "00:00");
  const endTomorrow = istWallToUtc(addDaysKey(tomorrowKey, 1), "00:00");

  const rows = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        isNull(bookings.reminderDayAt),
        gte(bookings.startAt, startTomorrow),
        lt(bookings.startAt, endTomorrow),
      ),
    )
    .limit(100);

  if (rows.length === 0) return { done: 0 };

  const [contact, consultData] = await Promise.all([
    getSetting("contact"),
    getConsultRows(),
  ]);

  let count = 0;
  for (const b of rows) {
    if (!b.email || !b.startAt) continue;

    const service = consultData.services.find((s) => s.key === b.serviceKey);
    const tier = consultData.tiers.find(
      (t) => t.serviceKey === b.serviceKey && t.tierKey === b.tierKey,
    );
    const isHi = b.locale === "hi";
    const serviceName = service ? (isHi ? service.nameHi : service.nameEn) : b.serviceKey;
    const tierTitle = tier ? (isHi ? tier.titleHi || tier.titleEn : tier.titleEn) : b.tierKey;

    const startFormatted = formatIst(b.startAt, {
      date: true,
      time: true,
      weekday: true,
      locale: b.locale as "en" | "hi",
    });

    const accessKey = accessKeyFor("booking", b.ref);
    const managePath = isHi
      ? `/hi/booking/${encodeURIComponent(b.ref)}?k=${encodeURIComponent(accessKey)}`
      : `/booking/${encodeURIComponent(b.ref)}?k=${encodeURIComponent(accessKey)}`;
    const manageUrl = absoluteUrl(managePath);

    const subject = getBookingReminderSubject(
      b.locale as Locale,
      "day",
      b.ref,
      serviceName,
    );

    try {
      await sendEmail({
        to: b.email,
        subject,
        react: createElement(BookingReminderEmail, {
          locale: b.locale as Locale,
          variant: "day",
          refCode: b.ref,
          customerName: b.name,
          serviceName,
          tierTitle,
          startFormatted,
          manageUrl,
          meetingLink: b.meetingLink,
          contact: {
            phoneDisplay: contact.phoneDisplay,
            email: contact.email,
          },
        }),
      });

      await db
        .update(bookings)
        .set({ reminderDayAt: now, updatedAt: now })
        .where(eq(bookings.id, b.id));

      count++;
    } catch (err) {
      log.error("cron.booking_day_reminder_failed", { bookingId: b.id, err });
    }
  }

  return { done: count };
}

/**
 * 4. Booking hour reminders: confirmed bookings starting in 45–75 minutes.
 */
export async function bookingHourReminders(now: Date): Promise<{ done: number }> {
  const minStart = new Date(now.getTime() + 45 * 60 * 1000);
  const maxStart = new Date(now.getTime() + 75 * 60 * 1000);

  const rows = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "confirmed"),
        isNull(bookings.reminderHourAt),
        gte(bookings.startAt, minStart),
        lte(bookings.startAt, maxStart),
      ),
    )
    .limit(100);

  if (rows.length === 0) return { done: 0 };

  const [contact, consultData] = await Promise.all([
    getSetting("contact"),
    getConsultRows(),
  ]);

  let count = 0;
  for (const b of rows) {
    if (!b.email || !b.startAt) continue;

    const service = consultData.services.find((s) => s.key === b.serviceKey);
    const tier = consultData.tiers.find(
      (t) => t.serviceKey === b.serviceKey && t.tierKey === b.tierKey,
    );
    const isHi = b.locale === "hi";
    const serviceName = service ? (isHi ? service.nameHi : service.nameEn) : b.serviceKey;
    const tierTitle = tier ? (isHi ? tier.titleHi || tier.titleEn : tier.titleEn) : b.tierKey;

    const startFormatted = formatIst(b.startAt, {
      date: true,
      time: true,
      weekday: true,
      locale: b.locale as "en" | "hi",
    });

    const accessKey = accessKeyFor("booking", b.ref);
    const managePath = isHi
      ? `/hi/booking/${encodeURIComponent(b.ref)}?k=${encodeURIComponent(accessKey)}`
      : `/booking/${encodeURIComponent(b.ref)}?k=${encodeURIComponent(accessKey)}`;
    const manageUrl = absoluteUrl(managePath);

    const subject = getBookingReminderSubject(
      b.locale as Locale,
      "hour",
      b.ref,
      serviceName,
    );

    try {
      await sendEmail({
        to: b.email,
        subject,
        react: createElement(BookingReminderEmail, {
          locale: b.locale as Locale,
          variant: "hour",
          refCode: b.ref,
          customerName: b.name,
          serviceName,
          tierTitle,
          startFormatted,
          manageUrl,
          meetingLink: b.meetingLink,
          contact: {
            phoneDisplay: contact.phoneDisplay,
            email: contact.email,
          },
        }),
      });

      await db
        .update(bookings)
        .set({ reminderHourAt: now, updatedAt: now })
        .where(eq(bookings.id, b.id));

      count++;
    } catch (err) {
      log.error("cron.booking_hour_reminder_failed", { bookingId: b.id, err });
    }
  }

  return { done: count };
}

/**
 * 5. Review requests: orders delivered 5–30 days ago without prior request.
 */
export async function reviewRequests(now: Date): Promise<{ done: number }> {
  const minDelivered = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const maxDelivered = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const deliveredOrders = await db
    .select({
      id: orders.id,
      number: orders.number,
      name: orders.name,
      email: orders.email,
      locale: orders.locale,
    })
    .from(orders)
    .where(
      and(
        eq(orders.status, "delivered"),
        gte(orders.deliveredAt, minDelivered),
        lte(orders.deliveredAt, maxDelivered),
      ),
    )
    .limit(100);

  if (deliveredOrders.length === 0) return { done: 0 };

  const contact = await getSetting("contact");
  let count = 0;

  for (const o of deliveredOrders) {
    const [existingEvent] = await db
      .select({ id: orderEvents.id })
      .from(orderEvents)
      .where(
        and(
          eq(orderEvents.orderId, o.id),
          eq(orderEvents.type, "review_request"),
        ),
      )
      .limit(1);

    if (existingEvent) continue;

    const items = await db
      .select({
        productId: orderItems.productId,
        nameEn: orderItems.nameEn,
        nameHi: orderItems.nameHi,
        slug: orderItems.slug,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, o.id));

    if (items.length === 0) continue;

    const reviewItems = items.map((i) => ({
      productId: i.productId,
      name: o.locale === "hi" ? i.nameHi : i.nameEn,
      url: absoluteUrl(
        o.locale === "hi"
          ? `/hi/product/${encodeURIComponent(i.slug)}#reviews`
          : `/product/${encodeURIComponent(i.slug)}#reviews`,
      ),
    }));

    try {
      await sendEmail({
        to: o.email,
        subject: getReviewRequestSubject(o.locale as Locale, o.number),
        react: createElement(ReviewRequestEmail, {
          locale: o.locale as Locale,
          customerName: o.name,
          orderNumber: o.number,
          items: reviewItems,
          contact: {
            phoneDisplay: contact.phoneDisplay,
            email: contact.email,
          },
        }),
      });

      await db.insert(orderEvents).values({
        orderId: o.id,
        type: "review_request",
        message: "Sent review request email",
        public: false,
      });

      count++;
    } catch (err) {
      log.error("cron.review_request_failed", { orderId: o.id, err });
    }
  }

  return { done: count };
}

/**
 * 6. Abandoned checkouts: drafts updated 1–48 h ago with no subsequent order.
 */
export async function abandonedCheckouts(now: Date): Promise<{ done: number }> {
  const minUpdated = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const maxUpdated = new Date(now.getTime() - 1 * 60 * 60 * 1000);

  const drafts = await db
    .select()
    .from(checkoutDrafts)
    .where(
      and(
        isNull(checkoutDrafts.orderId),
        isNull(checkoutDrafts.remindedAt),
        gte(checkoutDrafts.updatedAt, minUpdated),
        lte(checkoutDrafts.updatedAt, maxUpdated),
      ),
    )
    .limit(100);

  if (drafts.length === 0) return { done: 0 };

  const contact = await getSetting("contact");
  let count = 0;

  for (const d of drafts) {
    if (!d.email) {
      await db
        .update(checkoutDrafts)
        .set({ remindedAt: now })
        .where(eq(checkoutDrafts.token, d.token));
      continue;
    }

    const [recentOrder] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.email, d.email),
          gte(orders.createdAt, d.updatedAt),
        ),
      )
      .limit(1);

    if (recentOrder) {
      await db
        .update(checkoutDrafts)
        .set({ remindedAt: now })
        .where(eq(checkoutDrafts.token, d.token));
      continue;
    }

    const lines = d.lines ?? [];
    if (lines.length === 0) {
      await db
        .update(checkoutDrafts)
        .set({ remindedAt: now })
        .where(eq(checkoutDrafts.token, d.token));
      continue;
    }

    const pids = lines.map((l) => l.pid);
    const prodRows = await db
      .select({ id: products.id, nameEn: products.nameEn, nameHi: products.nameHi, priceInr: products.priceInr })
      .from(products)
      .where(inArray(products.id, pids));

    const lineItems = lines.map((l) => {
      const p = prodRows.find((pr) => pr.id === l.pid);
      const name = (d.locale === "hi" ? p?.nameHi : p?.nameEn) || p?.nameEn || l.pid;
      return {
        name,
        qty: l.qty,
        priceInr: p?.priceInr ?? 0,
      };
    });

    const cartUrl = absoluteUrl(d.locale === "hi" ? "/hi/cart" : "/cart");

    try {
      await sendEmail({
        to: d.email,
        subject: getAbandonedCheckoutSubject(d.locale as Locale),
        react: createElement(AbandonedCheckoutEmail, {
          locale: d.locale as Locale,
          customerName: d.name,
          lines: lineItems,
          totalInr: d.totalInr,
          cartUrl,
          contact: {
            phoneDisplay: contact.phoneDisplay,
            email: contact.email,
          },
        }),
      });

      await db
        .update(checkoutDrafts)
        .set({ remindedAt: now })
        .where(eq(checkoutDrafts.token, d.token));

      count++;
    } catch (err) {
      log.error("cron.abandoned_checkout_failed", { draftToken: d.token, err });
    }
  }

  return { done: count };
}

/**
 * 7. Delete palm photos for completed/cancelled/no_show/expired bookings older than 30 days.
 */
export async function deleteOldPalmPhotos(now: Date): Promise<{ done: number }> {
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      id: bookings.id,
      palmMediaIds: bookings.palmMediaIds,
    })
    .from(bookings)
    .where(
      and(
        inArray(bookings.status, ["completed", "cancelled", "no_show", "expired"]),
        or(
          and(sql`${bookings.endAt} IS NOT NULL`, lt(bookings.endAt, cutoff)),
          and(sql`${bookings.endAt} IS NULL`, lt(bookings.createdAt, cutoff)),
        ),
      ),
    )
    .limit(100);

  let count = 0;
  for (const b of rows) {
    const ids = b.palmMediaIds ?? [];
    if (ids.length === 0) continue;

    for (const mediaId of ids) {
      try {
        await deleteMedia(mediaId);
      } catch (err) {
        log.warn("cron.delete_palm_media_failed", { mediaId, err });
      }
    }

    await db
      .update(bookings)
      .set({ palmMediaIds: [], updatedAt: now })
      .where(eq(bookings.id, b.id));

    count++;
  }

  return { done: count };
}

/**
 * 8. Cleanup pending or unclaimed customer media older than 24 hours.
 */
export async function cleanupMedia(now: Date): Promise<{ done: number }> {
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const staleMedia = await db
    .select({ id: media.id })
    .from(media)
    .where(
      or(
        and(eq(media.status, "pending"), lt(media.createdAt, cutoff)),
        and(
          sql`${media.claimHash} IS NOT NULL`,
          isNull(media.ownerType),
          lt(media.createdAt, cutoff),
        ),
      ),
    )
    .limit(100);

  let count = 0;
  for (const m of staleMedia) {
    try {
      await deleteMedia(m.id);
      count++;
    } catch (err) {
      log.warn("cron.cleanup_media_failed", { mediaId: m.id, err });
    }
  }

  return { done: count };
}

/**
 * 9. Retry Kundali generation for stuck or failed orders (<= 5 per run).
 */
export async function retryKundali(now: Date): Promise<{ done: number }> {
  const cutoff = new Date(now.getTime() - 10 * 60 * 1000);

  const candidates = await db
    .select({ id: kundaliOrders.id, ref: kundaliOrders.ref })
    .from(kundaliOrders)
    .where(
      and(
        inArray(kundaliOrders.status, ["paid", "failed"]),
        lt(kundaliOrders.genAttempts, 5),
        lt(kundaliOrders.updatedAt, cutoff),
      ),
    )
    .limit(5);

  let count = 0;
  for (const order of candidates) {
    const url = absoluteUrl(`/api/kundali/${encodeURIComponent(order.ref)}/generate`);
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "x-internal-key": hmacHex("gen:" + order.ref),
        },
        signal: AbortSignal.timeout(45000),
      });
      count++;
    } catch (err) {
      log.warn("cron.retry_kundali_failed", { ref: order.ref, err });
    }
  }

  return { done: count };
}

/**
 * 10. Low stock and daily admin digest email.
 */
export async function adminDigest(now: Date): Promise<{ done: number }> {
  const notify = await getSetting("notify");
  if (!notify.adminEmails || notify.adminEmails.length === 0) {
    return { done: 0 };
  }

  const yesterdayKey = addDaysKey(istDayKey(now), -1);
  const startYesterday = istWallToUtc(yesterdayKey, "00:00");
  const endYesterday = istWallToUtc(istDayKey(now), "00:00");

  const yesterdayOrderRows = await db
    .select({
      id: orders.id,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      totalInr: orders.totalInr,
      status: orders.status,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startYesterday),
        lt(orders.createdAt, endYesterday),
        ne(orders.status, "cancelled"),
      ),
    );

  let totalRevenueInr = 0;
  let paidCount = 0;
  let codCount = 0;

  for (const o of yesterdayOrderRows) {
    if (o.paymentStatus === "paid" || o.paymentStatus === "cod_collected" || o.status === "delivered") {
      totalRevenueInr += o.totalInr;
    }
    if (o.paymentMethod === "cod") {
      codCount++;
    } else {
      paidCount++;
    }
  }

  const todayKey = istDayKey(now);
  const startToday = istWallToUtc(todayKey, "00:00");
  const endToday = istWallToUtc(addDaysKey(todayKey, 1), "00:00");

  const todayBookingRows = await db
    .select({
      ref: bookings.ref,
      name: bookings.name,
      serviceKey: bookings.serviceKey,
      mode: bookings.mode,
      startAt: bookings.startAt,
    })
    .from(bookings)
    .where(
      and(
        gte(bookings.startAt, startToday),
        lt(bookings.startAt, endToday),
        inArray(bookings.status, ["confirmed", "in_progress", "completed"]),
      ),
    );

  const consultData = await getConsultRows();
  const bookingsList = todayBookingRows.map((b) => {
    const svc = consultData.services.find((s) => s.key === b.serviceKey);
    return {
      ref: b.ref,
      timeFormatted: b.startAt
        ? formatIst(b.startAt, { date: false, time: true })
        : "—",
      customerName: b.name,
      serviceName: svc?.nameEn ?? b.serviceKey,
      mode: b.mode,
    };
  });

  const lowStockRows = await db
    .select({
      id: products.id,
      name: products.nameEn,
      stock: products.stock,
    })
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        lte(products.stock, 5),
      ),
    )
    .limit(20);

  const dateFormatted = formatIst(now, { date: true, time: false });
  const adminDashboardUrl = absoluteUrl("/admin");

  try {
    await sendEmail({
      to: notify.adminEmails,
      subject: getAdminDigestSubject(
        dateFormatted,
        yesterdayOrderRows.length,
        todayBookingRows.length,
      ),
      react: createElement(AdminDigestEmail, {
        dateFormatted,
        yesterdayOrders: {
          count: yesterdayOrderRows.length,
          totalRevenueInr,
          paidCount,
          codCount,
        },
        todayBookings: {
          count: todayBookingRows.length,
          list: bookingsList,
        },
        lowStockProducts: lowStockRows,
        adminDashboardUrl,
      }),
    });
    return { done: 1 };
  } catch (err) {
    log.error("cron.admin_digest_failed", { err });
    return { done: 0 };
  }
}

/**
 * 11. Cleanup ephemeral tables: sessions, OTP codes, rate limits, webhooks.
 */
export async function cleanupTables(now: Date): Promise<{ done: number }> {
  let count = 0;

  // Expired sessions
  const sRes = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, now))
    .returning({ id: sessions.id });
  count += sRes.length;

  // OTP codes > 1 day
  const cutoffOtp = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oRes = await db
    .delete(otpCodes)
    .where(lt(otpCodes.createdAt, cutoffOtp))
    .returning({ id: otpCodes.id });
  count += oRes.length;

  // Rate limits > 2 days
  const cutoffRateSec = Math.floor((now.getTime() - 2 * 24 * 60 * 60 * 1000) / 1000);
  const rRes = await db
    .delete(rateLimits)
    .where(lt(rateLimits.windowStart, cutoffRateSec))
    .returning({ key: rateLimits.key });
  count += rRes.length;

  // Webhook events > 30 days
  const cutoffWebhook = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const wRes = await db
    .delete(webhookEvents)
    .where(lt(webhookEvents.receivedAt, cutoffWebhook))
    .returning({ id: webhookEvents.id });
  count += wRes.length;

  return { done: count };
}
