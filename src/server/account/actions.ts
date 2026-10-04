"use server";

import { z } from "zod";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema/core";
import { addresses } from "@/server/db/schema/commerce";
import { requireCustomer } from "@/server/auth/guards";
import { runAction, AppError, type ActionResult } from "@/server/result";
import { addressInputSchema, profileSchema } from "@/lib/validation/account";

const idSchema = z
  .object({
    id: z.number().int().positive(),
  })
  .or(z.number().int().positive().transform((id) => ({ id })));

export async function saveAddressAction(
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const customer = await requireCustomer();
    const data = addressInputSchema.parse(input);

    if (data.id) {
      const [existing] = await db
        .select()
        .from(addresses)
        .where(and(eq(addresses.id, data.id), eq(addresses.userId, customer.id)))
        .limit(1);

      if (!existing) {
        throw new AppError("NOT_FOUND", "Address not found");
      }

      await db.transaction(async (tx) => {
        if (data.isDefault) {
          await tx
            .update(addresses)
            .set({ isDefault: false, updatedAt: new Date() })
            .where(and(eq(addresses.userId, customer.id), ne(addresses.id, data.id!)));
        }

        await tx
          .update(addresses)
          .set({
            name: data.name,
            phone: data.phone,
            line1: data.line1,
            line2: data.line2 || "",
            landmark: data.landmark || "",
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            isDefault: data.isDefault,
            updatedAt: new Date(),
          })
          .where(and(eq(addresses.id, data.id!), eq(addresses.userId, customer.id)));
      });

      return { id: data.id };
    }

    const [countRow] = await db
      .select({ count: count() })
      .from(addresses)
      .where(eq(addresses.userId, customer.id));

    const totalCount = countRow?.count ?? 0;
    if (totalCount >= 10) {
      throw new AppError("CONFLICT", "Maximum 10 addresses allowed");
    }

    const shouldBeDefault = data.isDefault || totalCount === 0;

    const [inserted] = await db.transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(addresses.userId, customer.id));
      }

      return tx
        .insert(addresses)
        .values({
          userId: customer.id,
          name: data.name,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2 || "",
          landmark: data.landmark || "",
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          isDefault: shouldBeDefault,
          updatedAt: new Date(),
        })
        .returning({ id: addresses.id });
    });

    return { id: inserted.id };
  });
}

export async function deleteAddressAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const customer = await requireCustomer();
    const { id } = idSchema.parse(input);

    const [existing] = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, customer.id)))
      .limit(1);

    if (!existing) {
      throw new AppError("NOT_FOUND", "Address not found");
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.userId, customer.id)));

      if (existing.isDefault) {
        const [nextDefault] = await tx
          .select({ id: addresses.id })
          .from(addresses)
          .where(eq(addresses.userId, customer.id))
          .orderBy(desc(addresses.id))
          .limit(1);

        if (nextDefault) {
          await tx
            .update(addresses)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(eq(addresses.id, nextDefault.id));
        }
      }
    });

    return { ok: true };
  });
}

export async function setDefaultAddressAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const customer = await requireCustomer();
    const { id } = idSchema.parse(input);

    const [existing] = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, customer.id)))
      .limit(1);

    if (!existing) {
      throw new AppError("NOT_FOUND", "Address not found");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(addresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(addresses.userId, customer.id));

      await tx
        .update(addresses)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(and(eq(addresses.id, id), eq(addresses.userId, customer.id)));
    });

    return { ok: true };
  });
}

export async function updateProfileAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const customer = await requireCustomer();
    const data = profileSchema.parse(input);

    await db
      .update(users)
      .set({
        name: data.name,
        phone: data.phone || null,
        birth: data.birth,
        marketingOptIn: data.marketingOptIn,
        updatedAt: new Date(),
      })
      .where(eq(users.id, customer.id));

    return { ok: true };
  });
}
