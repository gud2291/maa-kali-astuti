import "server-only";
import { after } from "next/server";
import { db } from "@/server/db/client";
import { inquiries, inquiryEvents } from "@/server/db/schema/crm";
import { randomDigits } from "@/server/ids";
import { getSetting } from "@/server/settings/queries";
import { sendEmail } from "@/server/email/send";
import { InquiryReceivedEmail } from "@/server/email/templates/InquiryReceivedEmail";
import { AdminInquiryAlertEmail } from "@/server/email/templates/AdminInquiryAlertEmail";
import { env } from "@/server/env";
import { log } from "@/server/log";
import { AppError } from "@/server/result";
import type { InquirySubmitInput } from "@/lib/validation/inquiry";
import type { CourseKey } from "@/lib/domain/enums";

export async function createInquiry(
  input: InquirySubmitInput,
  ctx?: { ip?: string | null; userId?: number | null },
): Promise<{ id: number; ref: string }> {
  const prefix = input.kind === "ritual" ? "MKA-R-" : "MKA-S-";
  let insertedId: number | null = null;
  let finalRef = "";

  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateRef = prefix + randomDigits(6);
    try {
      const [inserted] = await db
        .insert(inquiries)
        .values({
          ref: candidateRef,
          kind: input.kind,
          courseKey: input.kind === "course" ? (input.course as CourseKey) : null,
          locale: input.locale,
          name: input.name.trim(),
          phone: input.phone.trim(),
          email: input.email.trim() ? input.email.trim().toLowerCase() : null,
          city: input.city.trim(),
          exp: input.kind === "course" ? input.exp : null,
          area: input.kind === "ritual" ? input.area : null,
          lang: input.lang,
          why: input.why.trim(),
          status: "new",
          assignedTo: null,
          nextActionAt: null,
          feeInr: null,
          paidInr: 0,
          userId: ctx?.userId ?? null,
          ip: ctx?.ip ?? null,
        })
        .returning({ id: inquiries.id, ref: inquiries.ref });

      if (inserted) {
        insertedId = inserted.id;
        finalRef = inserted.ref;
        break;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("UNIQUE") || msg.includes("unique") || msg.includes("constraint")) {
        log.warn("inquiry.ref_collision", { attempt, candidateRef });
        continue;
      }
      log.error("inquiry.create_error", { error: msg });
      throw new AppError("INTERNAL", "Could not create inquiry");
    }
  }

  if (!insertedId || !finalRef) {
    throw new AppError("INTERNAL", "Could not generate unique inquiry reference");
  }

  // Insert inquiry event 'created'
  await db.insert(inquiryEvents).values({
    inquiryId: insertedId,
    type: "created",
    message: "Inquiry submitted on storefront",
    actorId: null,
  });

  // After-response side effects: send emails
  const inquiryId = insertedId;
  const inquiryRef = finalRef;
  const targetEmail = input.email.trim() ? input.email.trim().toLowerCase() : null;

  after(async () => {
    try {
      const [notifySettings, contactSettings] = await Promise.all([
        getSetting("notify"),
        getSetting("contact"),
      ]);

      const courseOrArea =
        input.kind === "course"
          ? input.course
            ? input.course.charAt(0).toUpperCase() + input.course.slice(1) + " Sadhana"
            : "Sadhana Course"
          : input.area
            ? `Ritual (${input.area})`
            : "Special Ritual";

      // 1. Send customer confirmation email if email provided
      if (targetEmail) {
        try {
          await sendEmail({
            to: targetEmail,
            subject:
              input.locale === "hi"
                ? `पूछताछ प्राप्त हुई: ${courseOrArea} (${inquiryRef}) — माँ काली स्तुति`
                : `Inquiry Received: ${courseOrArea} (${inquiryRef}) — Maa Kali Astuti`,
            react: (
              <InquiryReceivedEmail
                locale={input.locale}
                refCode={inquiryRef}
                customerName={input.name.trim()}
                kind={input.kind}
                targetTitle={courseOrArea}
                langPref={input.lang === "hindi" ? "हिंदी (Hindi)" : "English"}
                contact={{
                  phoneDisplay: contactSettings.phoneDisplay,
                  email: contactSettings.email,
                  whatsapp: contactSettings.whatsapp,
                }}
              />
            ),
          });
        } catch (emailErr) {
          log.error("inquiry.customer_email_error", {
            inquiryId,
            error: emailErr instanceof Error ? emailErr.message : String(emailErr),
          });
        }
      }

      // 2. Send admin alert email if inquiryAlerts enabled and admin emails exist
      if (notifySettings.inquiryAlerts && notifySettings.adminEmails.length > 0) {
        try {
          const adminUrl = `${env.APP_URL}/admin/inquiries/${inquiryId}`;
          const expOrLang =
            input.kind === "course"
              ? `Experience: ${input.exp || "Not specified"}`
              : `Call Language: ${input.lang || "Not specified"}`;

          await sendEmail({
            to: notifySettings.adminEmails,
            subject: `[New Inquiry] ${inquiryRef} · ${input.kind === "course" ? "Course" : "Ritual"} · ${input.name.trim()}`,
            react: (
              <AdminInquiryAlertEmail
                refCode={inquiryRef}
                inquiryId={inquiryId}
                kind={input.kind}
                name={input.name.trim()}
                phone={input.phone.trim()}
                email={targetEmail}
                city={input.city.trim()}
                courseOrArea={courseOrArea}
                expOrLang={expOrLang}
                why={input.why.trim()}
                adminUrl={adminUrl}
              />
            ),
          });
        } catch (adminEmailErr) {
          log.error("inquiry.admin_email_error", {
            inquiryId,
            error: adminEmailErr instanceof Error ? adminEmailErr.message : String(adminEmailErr),
          });
        }
      }
    } catch (err) {
      log.error("inquiry.after_error", {
        inquiryId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  return { id: insertedId, ref: finalRef };
}
