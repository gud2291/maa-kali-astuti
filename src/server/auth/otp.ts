import "server-only";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { otpCodes, users } from "@/server/db/schema/core";
import { ADMIN_ROLES, type OtpPurpose } from "@/lib/domain/enums";
import { AppError } from "@/server/result";
import { hmacHex, randomDigits, safeEqualHex } from "@/server/ids";

export const OTP_TTL_MS = 600000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;

export async function issueOtp({
  email,
  purpose,
  ip,
}: {
  email: string;
  purpose: OtpPurpose;
  ip: string;
}): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (purpose === "admin_login") {
    const adminRows = await db
      .select({ id: users.id, role: users.role, status: users.status })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    const adminUser = adminRows[0];
    if (
      !adminUser ||
      adminUser.status !== "active" ||
      !(ADMIN_ROLES as readonly string[]).includes(adminUser.role)
    ) {
      return null;
    }
  }

  // Consume older open codes for this identifier and purpose
  await db
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(
      and(
        eq(otpCodes.identifier, normalizedEmail),
        eq(otpCodes.purpose, purpose),
        isNull(otpCodes.consumedAt),
      ),
    );

  const code = randomDigits(6);
  const codeHash = hmacHex(`${normalizedEmail}:${code}`);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.insert(otpCodes).values({
    purpose,
    channel: "email",
    identifier: normalizedEmail,
    codeHash,
    attempts: 0,
    expiresAt,
    ip,
  });

  return code;
}

export async function verifyOtp({
  email,
  purpose,
  code,
}: {
  email: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  const rows = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.identifier, normalizedEmail),
        eq(otpCodes.purpose, purpose),
        isNull(otpCodes.consumedAt),
      ),
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  const otpRow = rows[0];
  if (!otpRow || otpRow.expiresAt.getTime() <= Date.now()) {
    if (otpRow) {
      await db
        .update(otpCodes)
        .set({ consumedAt: new Date() })
        .where(eq(otpCodes.id, otpRow.id));
    }
    throw new AppError("OTP_EXPIRED");
  }

  // Atomic attempts + 1 returning attempts
  const updatedRows = await db
    .update(otpCodes)
    .set({ attempts: sql`${otpCodes.attempts} + 1` })
    .where(eq(otpCodes.id, otpRow.id))
    .returning({ attempts: otpCodes.attempts });

  const attempts = updatedRows[0]?.attempts ?? otpRow.attempts + 1;

  if (attempts > OTP_MAX_ATTEMPTS) {
    await db
      .update(otpCodes)
      .set({ consumedAt: new Date() })
      .where(eq(otpCodes.id, otpRow.id));
    throw new AppError("OTP_EXPIRED");
  }

  const expectedHash = otpRow.codeHash;
  const providedHash = hmacHex(`${normalizedEmail}:${code}`);

  if (!safeEqualHex(expectedHash, providedHash)) {
    throw new AppError("OTP_INVALID");
  }

  // Success: consume the code
  await db
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(eq(otpCodes.id, otpRow.id));
}
