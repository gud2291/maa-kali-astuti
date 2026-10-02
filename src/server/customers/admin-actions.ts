"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { setCustomerBlocked, exportCustomersCsv } from "./admin";

const blockSchema = z.object({
  userId: z.number().int().positive(),
  blocked: z.boolean(),
});

export async function setCustomerBlockedAction(
  rawInput: unknown,
): Promise<ActionResult<{ success: true; blocked: boolean }>> {
  return runAction(async () => {
    const input = blockSchema.parse(rawInput);
    return setCustomerBlocked(input.userId, input.blocked);
  });
}

export async function exportCustomersCsvAction(): Promise<ActionResult<{ csv: string }>> {
  return runAction(async () => {
    const csv = await exportCustomersCsv();
    return { csv };
  });
}
