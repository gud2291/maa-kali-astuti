import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders } from "@/server/db/schema/commerce";
import { bookings, kundaliOrders } from "@/server/db/schema/consult";

export async function attachGuestRecords(
  userId: number,
  email: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ userId })
      .where(and(eq(orders.email, normalizedEmail), isNull(orders.userId)));
    await tx
      .update(bookings)
      .set({ userId })
      .where(and(eq(bookings.email, normalizedEmail), isNull(bookings.userId)));
    await tx
      .update(kundaliOrders)
      .set({ userId })
      .where(and(eq(kundaliOrders.email, normalizedEmail), isNull(kundaliOrders.userId)));
  });
}
