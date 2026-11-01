import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { stockMovements } from "@/server/db/schema/catalog";
import type { StockReason } from "@/lib/domain/enums";

type TxOrDb = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Record one stock change. balanceAfter is the stock level right after the change. */
export async function logStockMovement(
  tx: TxOrDb,
  m: {
    productId: string;
    delta: number;
    balanceAfter: number;
    reason: StockReason;
    orderId?: number | null;
    note?: string | null;
    actorId?: number | null;
  },
): Promise<void> {
  if (m.delta === 0) return;
  await tx.insert(stockMovements).values({
    productId: m.productId,
    delta: m.delta,
    balanceAfter: m.balanceAfter,
    reason: m.reason,
    orderId: m.orderId ?? null,
    note: m.note ?? null,
    actorId: m.actorId ?? null,
  });
}

export type StockMovementRow = typeof stockMovements.$inferSelect;

export async function listStockMovements(productId: string, limit = 25): Promise<StockMovementRow[]> {
  return db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.productId, productId))
    .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id))
    .limit(limit);
}
