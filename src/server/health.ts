import "server-only";

import { and, count, eq, lt, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { products } from "@/server/db/schema/catalog";
import { orders } from "@/server/db/schema/commerce";
import { bookings, kundaliOrders } from "@/server/db/schema/consult";
import { inquiries, subscribers } from "@/server/db/schema/crm";
import { media, users } from "@/server/db/schema/core";
import { requireAdmin } from "@/server/auth/guards";
import { env, isConfigured } from "@/server/env";
import { audit } from "@/server/audit";
import { sendEmail } from "@/server/email/send";
import { recomputeProductRating } from "@/server/reviews/service";

export type ServiceHealthStatus = {
  key: "r2" | "turnstile" | "email" | "razorpay" | "pdf" | "cron";
  name: string;
  configured: boolean;
  mode?: "live" | "test";
  hint?: string;
};

export type DatabaseHealth = {
  latencyMs: number;
  rowCounts: {
    products: number;
    orders: number;
    bookings: number;
    kundaliOrders: number;
    inquiries: number;
    subscribers: number;
    media: number;
  };
};

export type SystemHealthData = {
  services: ServiceHealthStatus[];
  database: DatabaseHealth;
  pendingMediaOlder24h: number;
  failedKundaliReports: number;
  ownerEmail: string;
};

/**
 * Check system health, service configurations, DB latency and row counts.
 * Requires "health.view" permission.
 */
export async function getHealth(): Promise<SystemHealthData> {
  await requireAdmin("health.view");

  const r2Ok = isConfigured("r2");
  const turnstileOk = isConfigured("turnstile");
  const emailOk = isConfigured("email");
  const rzpOk = isConfigured("razorpay");
  const pdfOk = isConfigured("pdf");
  const cronOk = isConfigured("cron");

  const rzpMode: "live" | "test" | undefined = rzpOk
    ? env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")
      ? "live"
      : env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
        ? "test"
        : undefined
    : undefined;

  const services: ServiceHealthStatus[] = [
    {
      key: "r2",
      name: "Cloudflare R2 Storage",
      configured: r2Ok,
      hint: r2Ok ? undefined : "Configure Cloudflare R2 bucket & API token in USER-SETUP §2",
    },
    {
      key: "turnstile",
      name: "Cloudflare Turnstile",
      configured: turnstileOk,
      hint: turnstileOk ? undefined : "Configure Turnstile site key & secret key in USER-SETUP §2",
    },
    {
      key: "email",
      name: "Resend Email Service",
      configured: emailOk,
      hint: emailOk ? undefined : "Configure Resend API key & sender email in USER-SETUP §4",
    },
    {
      key: "razorpay",
      name: "Razorpay Payments",
      configured: rzpOk,
      mode: rzpMode,
      hint: !rzpOk
        ? "Configure Razorpay key ID, secret & webhook secret in USER-SETUP §3"
        : rzpMode === "test"
          ? "Running in test mode (rzp_test_*)"
          : undefined,
    },
    {
      key: "pdf",
      name: "Cloudflare Browser Rendering (PDF)",
      configured: pdfOk,
      hint: pdfOk ? undefined : "Configure CF_ACCOUNT_ID and CF_BROWSER_TOKEN in USER-SETUP §2",
    },
    {
      key: "cron",
      name: "Vercel Cron Secret",
      configured: cronOk,
      hint: cronOk ? undefined : "Configure CRON_SECRET for automated jobs in USER-SETUP §5",
    },
  ];

  // Measure DB roundtrip latency
  const t0 = performance.now();
  await db.run(sql`SELECT 1`);
  const latencyMs = Math.round(performance.now() - t0);

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    prodRes,
    orderRes,
    bookRes,
    kundaliRes,
    inqRes,
    subRes,
    mediaRes,
    pendingMediaRes,
    failedKundaliRes,
    ownerUser,
  ] = await Promise.all([
    db.select({ count: count() }).from(products),
    db.select({ count: count() }).from(orders),
    db.select({ count: count() }).from(bookings),
    db.select({ count: count() }).from(kundaliOrders),
    db.select({ count: count() }).from(inquiries),
    db.select({ count: count() }).from(subscribers),
    db.select({ count: count() }).from(media),
    db
      .select({ count: count() })
      .from(media)
      .where(and(eq(media.status, "pending"), lt(media.createdAt, twentyFourHoursAgo))),
    db
      .select({ count: count() })
      .from(kundaliOrders)
      .where(eq(kundaliOrders.status, "failed")),
    db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, "owner"))
      .limit(1),
  ]);

  const ownerEmail =
    ownerUser[0]?.email ?? env.SEED_OWNER_EMAIL ?? "admin@sadhakpawanpandey.com";

  return {
    services,
    database: {
      latencyMs,
      rowCounts: {
        products: prodRes[0]?.count ?? 0,
        orders: orderRes[0]?.count ?? 0,
        bookings: bookRes[0]?.count ?? 0,
        kundaliOrders: kundaliRes[0]?.count ?? 0,
        inquiries: inqRes[0]?.count ?? 0,
        subscribers: subRes[0]?.count ?? 0,
        media: mediaRes[0]?.count ?? 0,
      },
    },
    pendingMediaOlder24h: pendingMediaRes[0]?.count ?? 0,
    failedKundaliReports: failedKundaliRes[0]?.count ?? 0,
    ownerEmail,
  };
}

/**
 * Send a verification test email to the store owner.
 * Audited.
 */
export async function sendTestEmail(): Promise<{ success: boolean; to: string }> {
  const admin = await requireAdmin("settings.edit");

  const ownerUser = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.role, "owner"))
    .limit(1);

  const targetEmail =
    ownerUser[0]?.email ?? env.SEED_OWNER_EMAIL ?? admin.email;

  await sendEmail({
    to: targetEmail,
    subject: `[Maa Kali Astuti] System Health Test Email`,
    react: (
      <div style={{ fontFamily: "sans-serif", padding: "24px", color: "#222" }}>
        <h2 style={{ color: "#78181b" }}>Maa Kali Astuti — System Health Test</h2>
        <p>This is a verification test email triggered from the admin health panel.</p>
        <p><strong>Triggered by:</strong> {admin.name || admin.email} ({admin.role})</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        <hr style={{ margin: "20px 0", borderColor: "#e5e0d8" }} />
        <p style={{ fontSize: "12px", color: "#666" }}>
          If you received this email, the Resend integration is operational.
        </p>
      </div>
    ),
    devNote: "Health test email triggered from /admin/health",
  });

  await audit({
    actorId: admin.id,
    action: "health.send_test_email",
    entity: "system",
    entityId: targetEmail,
    summary: `Sent system verification test email to ${targetEmail}`,
  });

  return { success: true, to: targetEmail };
}

/**
 * Recalculate average star ratings and review counts for every product from approved reviews.
 * Products with 0 approved reviews reset to 0/0.
 * Audited.
 */
export async function recalculateAllRatings(): Promise<{ success: boolean; count: number }> {
  const admin = await requireAdmin("settings.edit");

  const allProds = await db.select({ id: products.id }).from(products);

  // Process in chunks of 10
  for (let i = 0; i < allProds.length; i += 10) {
    const chunk = allProds.slice(i, i + 10);
    await Promise.all(chunk.map((p) => recomputeProductRating(p.id)));
  }

  await audit({
    actorId: admin.id,
    action: "health.recompute_ratings",
    entity: "products",
    entityId: "all",
    summary: `Recalculated product star ratings for ${allProds.length} products`,
  });

  return { success: true, count: allProds.length };
}
