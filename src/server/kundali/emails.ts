import "server-only";

import { createElement, type CSSProperties } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { kundaliOrders } from "@/server/db/schema/consult";
import { getSetting } from "@/server/settings/queries";
import { accessKeyFor } from "@/server/ids";
import { absoluteUrl } from "@/server/request";
import { signedPrivateUrl } from "@/server/media/service";
import { sendEmail, type EmailAttachment } from "@/server/email/send";
import { log } from "@/server/log";
import {
  KundaliReadyEmail,
  getKundaliReadySubject,
} from "@/server/email/templates/KundaliReadyEmail";
import { EmailShell, EmailText, EmailButton } from "@/server/email/components";

/**
 * Sends the customer an email with the link to their web Janampatri
 * and signed download link (with PDF attached if <= 5 MB).
 */
export async function sendKundaliReady(
  orderId: number,
  pdfBuffer?: Uint8Array,
): Promise<void> {
  try {
    const [order] = await db
      .select()
      .from(kundaliOrders)
      .where(eq(kundaliOrders.id, orderId))
      .limit(1);

    if (!order) {
      log.warn("kundali.email_not_found", { orderId });
      return;
    }

    if (!order.email) {
      log.info("kundali.email_skipped_no_recipient", { orderId, ref: order.ref });
      return;
    }

    const [contact] = await Promise.all([getSetting("contact")]);

    const accessKey = accessKeyFor("kundali", order.ref);
    const reportUrl = absoluteUrl(`/kundali/report/${order.ref}?k=${accessKey}`);

    const safeFilename = `Janam-Kundali-${order.name.trim().replace(/\s+/g, "-")}.pdf`;
    let pdfUrl: string | null = null;
    if (order.pdfMediaId) {
      try {
        pdfUrl = await signedPrivateUrl(order.pdfMediaId, safeFilename);
      } catch (err) {
        log.warn("kundali.pdf_signed_url_failed", { orderId, err });
      }
    }

    const attachments: EmailAttachment[] = [];
    let hasAttachment = false;

    if (pdfBuffer && pdfBuffer.byteLength <= 5 * 1024 * 1024) {
      attachments.push({
        filename: safeFilename,
        content: Buffer.from(pdfBuffer),
      });
      hasAttachment = true;
    }

    const subject = getKundaliReadySubject(order.reportLang, order.name);

    await sendEmail({
      to: order.email,
      subject,
      react: createElement(KundaliReadyEmail, {
        locale: order.reportLang,
        refCode: order.ref,
        name: order.name,
        dob: order.dob,
        place: order.place,
        reportUrl,
        pdfUrl,
        hasAttachment,
        contact: {
          phoneDisplay: contact.phoneDisplay,
          email: contact.email,
        },
      }),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    await db
      .update(kundaliOrders)
      .set({
        emailedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(kundaliOrders.id, orderId));

    log.info("kundali.ready_email_sent", { orderId, ref: order.ref, to: order.email });
  } catch (err) {
    log.error("kundali.send_ready_failed", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Notifies admins when report generation has failed after max attempts (5th attempt).
 */
export async function alertKundaliGenerationFailed(
  orderId: number,
  error: string,
): Promise<void> {
  try {
    const notify = await getSetting("notify");
    if (!notify.adminEmails.length) return;

    const [order] = await db
      .select()
      .from(kundaliOrders)
      .where(eq(kundaliOrders.id, orderId))
      .limit(1);

    if (!order) return;

    const adminUrl = absoluteUrl(`/admin/kundali/${order.id}`);

    await sendEmail({
      to: notify.adminEmails,
      subject: `🚨 [Alert] Kundali Generation Failed: ${order.ref} (${order.name})`,
      react: createElement(EmailShell, {
        locale: "en",
        preview: `Kundali generation failed for ${order.ref}`,
        children: createElement(
          "div",
          { style: { padding: "0 24px" } },
          createElement(
            "h2",
            { style: { color: "#A8322D", margin: "0 0 16px 0" } },
            "Kundali Generation Failed (5 Attempts)",
          ),
          createElement(
            EmailText,
            null,
            "Report generation for ",
            createElement("strong", null, order.name),
            ` (${order.ref}) has reached the maximum of 5 attempts and failed.`,
          ),
          createElement(
            "div",
            {
              style: {
                backgroundColor: "#FDF2F2",
                border: "1px solid #F5C6CB",
                padding: "12px 16px",
                borderRadius: "4px",
                color: "#721C24",
                fontFamily: "monospace",
                fontSize: "13px",
                margin: "16px 0",
              },
            },
            error,
          ),
          createElement(
            "div",
            { style: { textAlign: "center", margin: "24px 0" } satisfies CSSProperties },
            createElement(EmailButton, { href: adminUrl, children: "View in Admin" }),
          ),
        ),
      }),
    });
  } catch (err) {
    log.error("kundali.admin_alert_failed", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
