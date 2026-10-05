import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { messages, subscribers } from "@/server/db/schema/crm";
import { randomToken } from "@/server/ids";
import { log, maskEmail } from "@/server/log";
import { AppError } from "@/server/result";
import type { ContactInput } from "@/lib/validation/contact";
import type { Locale, MessageTopic } from "@/lib/domain/enums";

export async function createMessage(
  input: ContactInput,
  ctx: { ip: string },
): Promise<{ id: number }> {
  const [inserted] = await db
    .insert(messages)
    .values({
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      topic: input.topic as MessageTopic,
      body: input.body.trim(),
      locale: input.locale as Locale,
      status: "new",
      ip: ctx.ip,
    })
    .returning({ id: messages.id });

  if (!inserted) {
    throw new AppError("INTERNAL", "Could not create message");
  }

  return { id: inserted.id };
}

export async function subscribe(
  email: string,
  locale: Locale,
  source: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const token = randomToken(24);

  const [existing] = await db
    .select({ id: subscribers.id, status: subscribers.status })
    .from(subscribers)
    .where(eq(subscribers.email, normalizedEmail))
    .limit(1);

  if (existing) {
    await db
      .update(subscribers)
      .set({
        status: "subscribed",
        unsubscribedAt: null,
        locale,
        source,
      })
      .where(eq(subscribers.id, existing.id));
    return;
  }

  try {
    await db.insert(subscribers).values({
      email: normalizedEmail,
      locale,
      source,
      status: "subscribed",
      unsubToken: token,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("UNIQUE") || msg.includes("unique") || msg.includes("constraint")) {
      log.warn("subscriber.duplicate", { email: maskEmail(normalizedEmail) });
      return;
    }
    throw err;
  }
}

export async function unsubscribe(token: string): Promise<void> {
  const [row] = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(eq(subscribers.unsubToken, token))
    .limit(1);

  if (!row) {
    throw new AppError("NOT_FOUND", "Invalid unsubscribe link");
  }

  await db
    .update(subscribers)
    .set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    })
    .where(eq(subscribers.id, row.id));
}
