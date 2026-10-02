"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import {
  createRitual,
  updateRitual,
  deleteRitual,
  reorderRituals,
} from "./admin";

export async function createRitualAction(
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const res = await createRitual(input);
    invalidate(TAG.rituals);
    return res;
  });
}

export async function updateRitualAction(
  id: number,
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const res = await updateRitual(validId, input);
    invalidate(TAG.rituals);
    return res;
  });
}

export async function deleteRitualAction(
  id: number,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const res = await deleteRitual(validId);
    invalidate(TAG.rituals);
    return res;
  });
}

export async function reorderRitualsAction(
  ids: number[],
): Promise<ActionResult<{ count: number }>> {
  return runAction(async () => {
    const validIds = z.array(z.number().int().positive()).max(200).parse(ids);
    const res = await reorderRituals(validIds);
    invalidate(TAG.rituals);
    return res;
  });
}
