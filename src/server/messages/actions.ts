"use server";

import { after } from "next/server";
import { runAction, type ActionResult } from "@/server/result";
import { clientIp } from "@/server/request";
import { verifyTurnstile } from "@/server/auth/turnstile";
import { rateLimit } from "@/server/rate-limit";
import { contactSchema } from "@/lib/validation/contact";
import { newsletterSchema } from "@/lib/validation/newsletter";
import { createMessage, subscribe, unsubscribe } from "./service";
import { getSetting } from "@/server/settings/queries";
import { sendEmail } from "@/server/email/send";
import { ContactAlertEmail } from "@/server/email/templates/ContactAlertEmail";
import { env } from "@/server/env";
import { log } from "@/server/log";
import { z } from "zod";
import type { MessageTopic } from "@/lib/domain/enums";

export async function submitContactAction(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const data = contactSchema.parse(input);
    const ip = await clientIp();

    await verifyTurnstile(data.turnstileToken, ip);
    await rateLimit("contact:ip", ip, 5, 3600);

    const { id } = await createMessage(data, { ip });

    after(async () => {
      try {
        const notifySettings = await getSetting("notify");
        if (notifySettings.adminEmails.length > 0) {
          const adminUrl = `${env.APP_URL}/admin/messages`;
          await sendEmail({
            to: notifySettings.adminEmails,
            subject: `[Contact] ${data.topic} · ${data.name.trim()}`,
            react: (
              <ContactAlertEmail
                messageId={id}
                name={data.name.trim()}
                phone={data.phone?.trim() || null}
                email={data.email?.trim().toLowerCase() || null}
                topic={data.topic as MessageTopic}
                body={data.body.trim()}
                adminUrl={adminUrl}
              />
            ),
          });
        }
      } catch (err) {
        log.error("contact.alert_email_error", {
          messageId: id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    return { success: true as const };
  });
}

export async function subscribeAction(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const data = newsletterSchema.parse(input);
    const ip = await clientIp();

    await verifyTurnstile(data.turnstileToken, ip);
    await rateLimit("newsletter:ip", ip, 5, 3600);

    await subscribe(data.email, data.locale, data.source);

    return { success: true as const };
  });
}

export async function unsubscribeAction(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const { token } = z.object({ token: z.string().min(1) }).parse(input);
    await unsubscribe(token);
    return { success: true as const };
  });
}
