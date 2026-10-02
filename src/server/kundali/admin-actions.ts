"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { regenerate, resendEmail } from "./admin";

const idInputSchema = z.object({
  id: z.number().int().positive(),
});

export async function regenerateKundaliAction(
  input: unknown,
): Promise<ActionResult<{ status: string }>> {
  return runAction(async () => {
    const { id } = idInputSchema.parse(input);
    return await regenerate(id);
  });
}

export async function resendKundaliEmailAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const { id } = idInputSchema.parse(input);
    return await resendEmail(id);
  });
}
