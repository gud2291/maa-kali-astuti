import "server-only";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { sessions, users } from "@/server/db/schema/core";
import { ADMIN_ROLES, type SessionKind } from "@/lib/domain/enums";
import { randomToken, sha256Hex } from "@/server/ids";
import { clientIp, userAgent } from "@/server/request";
import { env } from "@/server/env";

export type UserRow = typeof users.$inferSelect;

export const SESSION_MAX_AGE: Record<SessionKind, number> = {
  customer: 30 * 24 * 60 * 60, // 30 days in seconds
  admin: 7 * 24 * 60 * 60, // 7 days in seconds
};

export function cookieName(kind: SessionKind): string {
  const base = kind === "customer" ? "mka_c" : "mka_a";
  return env.NODE_ENV === "production" ? `__Host-${base}` : base;
}

export async function createSession(userId: number, kind: SessionKind): Promise<string> {
  const token = randomToken(32);
  const sessionId = sha256Hex(token);
  const maxAge = SESSION_MAX_AGE[kind];
  const expiresAt = new Date(Date.now() + maxAge * 1000);
  const ip = await clientIp();
  const ua = await userAgent();

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    kind,
    expiresAt,
    ip,
    userAgent: ua,
  });

  const cookieStore = await cookies();
  cookieStore.set(cookieName(kind), token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return sessionId;
}

export async function readSession(
  kind: SessionKind,
): Promise<{ sessionId: string; user: UserRow } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName(kind))?.value;
  if (!token) return null;

  const sessionId = sha256Hex(token);

  const rows = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  if (row.session.kind !== kind) return null;
  if (row.session.expiresAt.getTime() <= Date.now()) return null;
  if (row.user.status !== "active") return null;

  if (kind === "admin") {
    if (!(ADMIN_ROLES as readonly string[]).includes(row.user.role)) {
      return null;
    }
  }

  return {
    sessionId: row.session.id,
    user: row.user,
  };
}

export async function endSession(kind: SessionKind): Promise<void> {
  const cookieStore = await cookies();
  const name = cookieName(kind);
  const token = cookieStore.get(name)?.value;

  if (token) {
    const sessionId = sha256Hex(token);
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  cookieStore.delete(name);
  cookieStore.set(name, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function revokeUserSessions(userId: number): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
