import "server-only";
import {
  eq,
  and,
  or,
  like,
  ne,
  desc,
  count,
  isNull,
  isNotNull,
  gte,
  lte,
  lt,
  type SQL,
} from "drizzle-orm";
import { db } from "@/server/db/client";
import { coupons } from "@/server/db/schema/commerce";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import type { CouponInput } from "@/lib/validation/coupon";

export type CouponRow = typeof coupons.$inferSelect;

export type ListCouponsParams = {
  status?: "active" | "inactive" | "expired";
  search?: string;
  page?: number;
};

export type ListCouponsResult = {
  rows: CouponRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listCoupons(
  params: ListCouponsParams = {},
): Promise<ListCouponsResult> {
  await requireAdmin("coupons.edit");

  const pageSize = 20;
  const page = Math.max(1, params.page ?? 1);
  const offset = (page - 1) * pageSize;
  const now = new Date();

  const conditions: SQL[] = [];

  if (params.search && params.search.trim() !== "") {
    const q = `%${params.search.trim().toUpperCase()}%`;
    conditions.push(
      or(
        like(coupons.code, q),
        like(coupons.note, `%${params.search.trim()}%`),
      )!,
    );
  }

  if (params.status === "active") {
    conditions.push(
      and(
        eq(coupons.active, true),
        or(isNull(coupons.startsAt), lte(coupons.startsAt, now)),
        or(isNull(coupons.endsAt), gte(coupons.endsAt, now)),
      )!,
    );
  } else if (params.status === "inactive") {
    conditions.push(eq(coupons.active, false));
  } else if (params.status === "expired") {
    conditions.push(
      and(
        eq(coupons.active, true),
        isNotNull(coupons.endsAt),
        lt(coupons.endsAt, now),
      )!,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(coupons)
      .where(whereClause),
    db
      .select()
      .from(coupons)
      .where(whereClause)
      .orderBy(desc(coupons.createdAt))
      .limit(pageSize)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getCoupon(id: number): Promise<CouponRow | null> {
  await requireAdmin("coupons.edit");

  const rows = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function createCoupon(input: CouponInput): Promise<CouponRow> {
  const admin = await requireAdmin("coupons.edit");

  const existing = await db
    .select({ id: coupons.id })
    .from(coupons)
    .where(eq(coupons.code, input.code))
    .limit(1);

  if (existing.length > 0) {
    throw new AppError("CONFLICT", { code: "A coupon with this code already exists" });
  }

  const [row] = await db
    .insert(coupons)
    .values({
      code: input.code,
      kind: input.kind,
      value: input.value,
      minCartInr: input.minCartInr,
      maxDiscountInr: input.maxDiscountInr,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      usageLimit: input.usageLimit,
      perCustomerLimit: input.perCustomerLimit,
      firstOrderOnly: input.firstOrderOnly,
      active: input.active,
      usedCount: 0,
      note: input.note,
    })
    .returning();

  await audit({
    actorId: admin.id,
    action: "coupon.create",
    entity: "coupon",
    entityId: row.id,
    summary: `Created coupon ${row.code}`,
  });

  return row;
}

export async function updateCoupon(
  id: number,
  input: CouponInput,
): Promise<CouponRow> {
  const admin = await requireAdmin("coupons.edit");

  const existing = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);

  const prev = existing[0];
  if (!prev) {
    throw new AppError("NOT_FOUND");
  }

  if (input.code !== prev.code) {
    const conflict = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(and(eq(coupons.code, input.code), ne(coupons.id, id)))
      .limit(1);

    if (conflict.length > 0) {
      throw new AppError("CONFLICT", { code: "A coupon with this code already exists" });
    }
  }

  const diff: Record<string, [unknown, unknown]> = {};
  for (const [k, v] of Object.entries(input)) {
    const prevVal = (prev as Record<string, unknown>)[k];
    if (JSON.stringify(prevVal) !== JSON.stringify(v)) {
      diff[k] = [prevVal, v];
    }
  }

  const [row] = await db
    .update(coupons)
    .set({
      code: input.code,
      kind: input.kind,
      value: input.value,
      minCartInr: input.minCartInr,
      maxDiscountInr: input.maxDiscountInr,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      usageLimit: input.usageLimit,
      perCustomerLimit: input.perCustomerLimit,
      firstOrderOnly: input.firstOrderOnly,
      active: input.active,
      note: input.note,
      updatedAt: new Date(),
    })
    .where(eq(coupons.id, id))
    .returning();

  await audit({
    actorId: admin.id,
    action: "coupon.update",
    entity: "coupon",
    entityId: id,
    summary: `Updated coupon ${row.code}`,
    diff,
  });

  return row;
}

export async function setCouponActive(
  id: number,
  active: boolean,
): Promise<void> {
  const admin = await requireAdmin("coupons.edit");

  const existing = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);

  const prev = existing[0];
  if (!prev) {
    throw new AppError("NOT_FOUND");
  }

  await db
    .update(coupons)
    .set({ active, updatedAt: new Date() })
    .where(eq(coupons.id, id));

  await audit({
    actorId: admin.id,
    action: "coupon.status",
    entity: "coupon",
    entityId: id,
    summary: `${active ? "Activated" : "Deactivated"} coupon ${prev.code}`,
    diff: { active: [prev.active, active] },
  });
}

export async function deleteCoupon(id: number): Promise<void> {
  const admin = await requireAdmin("coupons.edit");

  const existing = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);

  const prev = existing[0];
  if (!prev) {
    throw new AppError("NOT_FOUND");
  }

  if (prev.usedCount > 0) {
    throw new AppError("CONFLICT", {
      reason: "Cannot delete a coupon that has already been used. Please deactivate it instead.",
    });
  }

  await db.delete(coupons).where(eq(coupons.id, id));

  await audit({
    actorId: admin.id,
    action: "coupon.delete",
    entity: "coupon",
    entityId: id,
    summary: `Deleted coupon ${prev.code}`,
  });
}
