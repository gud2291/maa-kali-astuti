"use server";

import { z } from "zod";
import { runAction } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import { updateSetting, ADMIN_SETTINGS_KEYS } from "./admin";
import type { ActionResult } from "@/lib/domain/errors";

const updateSettingSchema = z.object({
  key: z.enum(ADMIN_SETTINGS_KEYS),
  value: z.unknown(),
});

export async function updateSettingAction(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const { key, value } = updateSettingSchema.parse(input);
    await updateSetting(key, value);
    invalidate(TAG.settings);
    return { success: true };
  });
}
