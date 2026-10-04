import "server-only";
import { createElement } from "react";
import { after } from "next/server";
import { eq, and, inArray, count, desc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema/core";
import { requireAdmin } from "@/server/auth/guards";
import { revokeUserSessions } from "@/server/auth/session";
import { audit } from "@/server/audit";
import { sendEmail } from "@/server/email/send";
import { StaffInviteEmail } from "@/server/email/templates/StaffInviteEmail";
import { env } from "@/server/env";
import { log } from "@/server/log";
import { AppError } from "@/server/result";
import { ADMIN_ROLES, type AdminRole } from "@/lib/domain/enums";
import type { AddStaffInput } from "@/lib/validation/staff";

export type StaffMemberRow = {
  id: number;
  email: string | null;
  name: string | null;
  role: AdminRole;
  status: "active" | "blocked";
  lastLoginAt: Date | null;
  createdAt: Date;
};

export async function listStaff(): Promise<StaffMemberRow[]> {
  await requireAdmin("staff.manage");

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(inArray(users.role, [...ADMIN_ROLES]))
    .orderBy(desc(users.createdAt));

  return rows.map((r) => ({
    ...r,
    role: r.role as AdminRole,
    status: (r.status === "blocked" ? "blocked" : "active") as "active" | "blocked",
  }));
}

export async function addStaff(
  input: AddStaffInput,
): Promise<{ success: true; userId: number }> {
  const admin = await requireAdmin("staff.manage");
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingRows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  let targetUserId: number;

  if (existingRows.length > 0) {
    const existing = existingRows[0];
    targetUserId = existing.id;

    await db
      .update(users)
      .set({
        name: input.name,
        role: input.role,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, targetUserId));
  } else {
    const [inserted] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: input.name,
        role: input.role,
        status: "active",
      })
      .returning({ id: users.id });

    targetUserId = inserted.id;
  }

  const loginUrl = `${env.APP_URL}/admin/login`;

  after(async () => {
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "You've been invited to the Maa Kali Astuti Admin Team",
        react: createElement(StaffInviteEmail, {
          name: input.name,
          role: input.role,
          loginUrl,
        }),
      });
    } catch (err) {
      log.error("staff.invite_email_failed", err);
    }
  });

  await audit({
    actorId: admin.id,
    action: "staff.add",
    entity: "user",
    entityId: targetUserId,
    summary: `Added or upgraded ${normalizedEmail} to staff role ${input.role}`,
  });

  return { success: true, userId: targetUserId };
}

export async function changeRole(
  userId: number,
  role: AdminRole,
): Promise<void> {
  const admin = await requireAdmin("staff.manage");

  if (userId === admin.id) {
    throw new AppError("FORBIDDEN", "You cannot change your own staff role");
  }

  const existingRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const target = existingRows[0];
  if (!target) {
    throw new AppError("NOT_FOUND");
  }

  if (target.role === "owner" && role !== "owner") {
    const [ownerCount] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.role, "owner"), eq(users.status, "active")));

    if ((ownerCount?.count ?? 0) <= 1) {
      throw new AppError("CONFLICT", "At least one active owner must remain");
    }
  }

  await db
    .update(users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await audit({
    actorId: admin.id,
    action: "staff.role",
    entity: "user",
    entityId: userId,
    summary: `Changed staff role of ${target.email} from ${target.role} to ${role}`,
    diff: { role: [target.role, role] },
  });
}

export async function setStaffStatus(
  userId: number,
  status: "active" | "blocked",
): Promise<void> {
  const admin = await requireAdmin("staff.manage");

  if (userId === admin.id) {
    throw new AppError("FORBIDDEN", "You cannot change your own account status");
  }

  const existingRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const target = existingRows[0];
  if (!target) {
    throw new AppError("NOT_FOUND");
  }

  if (target.role === "owner" && status === "blocked") {
    const [ownerCount] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.role, "owner"), eq(users.status, "active")));

    if ((ownerCount?.count ?? 0) <= 1) {
      throw new AppError("CONFLICT", "At least one active owner must remain");
    }
  }

  await db
    .update(users)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  if (status === "blocked") {
    await revokeUserSessions(userId);
  }

  await audit({
    actorId: admin.id,
    action: "staff.status",
    entity: "user",
    entityId: userId,
    summary: `${status === "blocked" ? "Blocked" : "Activated"} staff member ${target.email}`,
    diff: { status: [target.status, status] },
  });
}

export async function removeStaff(userId: number): Promise<void> {
  const admin = await requireAdmin("staff.manage");

  if (userId === admin.id) {
    throw new AppError("FORBIDDEN", "You cannot remove yourself from staff");
  }

  const existingRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const target = existingRows[0];
  if (!target) {
    throw new AppError("NOT_FOUND");
  }

  if (target.role === "owner") {
    const [ownerCount] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.role, "owner"), eq(users.status, "active")));

    if ((ownerCount?.count ?? 0) <= 1) {
      throw new AppError("CONFLICT", "At least one active owner must remain");
    }
  }

  await db
    .update(users)
    .set({
      role: "customer",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await revokeUserSessions(userId);

  await audit({
    actorId: admin.id,
    action: "staff.remove",
    entity: "user",
    entityId: userId,
    summary: `Removed staff access for ${target.email} (demoted to customer)`,
  });
}
