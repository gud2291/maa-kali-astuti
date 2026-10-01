"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema/core";
import { SESSION_KINDS, ADMIN_ROLES } from "@/lib/domain/enums";
import { otpRequestSchema, otpVerifySchema } from "@/lib/validation/auth";
import { runAction, AppError, type ActionResult } from "@/server/result";
import { clientIp } from "@/server/request";
import { rateLimit } from "@/server/rate-limit";
import { audit } from "@/server/audit";
import { getSetting } from "@/server/settings/queries";
import { sendEmail } from "@/server/email/send";
import { OtpEmail, otpSubject } from "@/server/email/templates/OtpEmail";
import { verifyTurnstile } from "./turnstile";
import { issueOtp, verifyOtp } from "./otp";
import { createSession, endSession } from "./session";
import { attachGuestRecords } from "./claims";

const logoutSchema = z.enum(SESSION_KINDS);

export async function requestOtpAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const data = otpRequestSchema.parse(input);
    const ip = await clientIp();

    await verifyTurnstile(data.turnstileToken, ip);

    await rateLimit("otp:email", data.email, 3, 15 * 60);
    await rateLimit("otp:ip", ip, 10, 60 * 60);

    const code = await issueOtp({
      email: data.email,
      purpose: data.purpose,
      ip,
    });

    if (code !== null) {
      const contact = await getSetting("contact");
      const subject = otpSubject(data.locale);

      await sendEmail({
        to: data.email,
        subject,
        react: (
          <OtpEmail
            code={code}
            locale={data.locale}
            purpose={data.purpose}
            contact={contact}
          />
        ),
        devNote: `OTP code: ${code}`,
      });
    }

    return { ok: true };
  });
}

export async function verifyOtpAction(
  input: unknown,
): Promise<ActionResult<{ next: string }>> {
  return runAction(async () => {
    const data = otpVerifySchema.parse(input);
    const ip = await clientIp();

    await rateLimit("otp:verify", ip, 20, 60 * 60);

    await verifyOtp({
      email: data.email,
      purpose: data.purpose,
      code: data.code,
    });

    const now = new Date();

    if (data.purpose === "login") {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      let user = userRows[0];

      if (!user) {
        const inserted = await db
          .insert(users)
          .values({
            email: data.email,
            role: "customer",
            status: "active",
            emailVerifiedAt: now,
            lastLoginAt: now,
          })
          .returning();
        user = inserted[0];
      } else {
        if (user.status !== "active") {
          throw new AppError("FORBIDDEN");
        }
        await db
          .update(users)
          .set({
            emailVerifiedAt: now,
            lastLoginAt: now,
          })
          .where(eq(users.id, user.id));
      }

      await attachGuestRecords(user.id, data.email);
      await createSession(user.id, "customer");

      let nextUrl = "/account";
      if (
        data.next &&
        data.next.startsWith("/") &&
        !data.next.startsWith("//") &&
        !data.next.startsWith("/admin")
      ) {
        nextUrl = data.next;
      }

      return { next: nextUrl };
    }

    // Admin login
    const adminRows = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    const adminUser = adminRows[0];
    if (
      !adminUser ||
      adminUser.status !== "active" ||
      !(ADMIN_ROLES as readonly string[]).includes(adminUser.role)
    ) {
      throw new AppError("UNAUTHENTICATED");
    }

    await db
      .update(users)
      .set({ lastLoginAt: now })
      .where(eq(users.id, adminUser.id));

    await createSession(adminUser.id, "admin");

    await audit({
      actorId: adminUser.id,
      action: "auth.login",
      entity: "users",
      entityId: adminUser.id,
      summary: `Admin login by ${adminUser.email}`,
      ip,
    });

    return { next: "/admin" };
  });
}

export async function logoutAction(
  kindInput: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const kind = logoutSchema.parse(kindInput);
    await endSession(kind);
    return { ok: true };
  });
}
