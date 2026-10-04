"use server";

import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import {
  updateService,
  updateTier,
  updateConsultSettings,
} from "./admin";
import type {
  ServiceAdminInput,
  TierAdminInput,
  ConsultSettingsAdminInput,
} from "@/lib/validation/consult-admin";
import type { ServiceKey, TierKey } from "@/lib/domain/enums";

export async function updateServiceAction(
  key: ServiceKey,
  input: ServiceAdminInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    await updateService(key, input);
    invalidate(TAG.consult);
    return { ok: true };
  });
}

export async function updateTierAction(
  serviceKey: ServiceKey,
  tierKey: TierKey,
  input: TierAdminInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    await updateTier(serviceKey, tierKey, input);
    invalidate(TAG.consult);
    return { ok: true };
  });
}

export async function updateConsultSettingsAction(
  input: ConsultSettingsAdminInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    await updateConsultSettings(input);
    invalidate(TAG.settings);
    return { ok: true };
  });
}
