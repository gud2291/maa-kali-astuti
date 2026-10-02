"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import {
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
} from "./admin";
import { FAQ_SETS, type FaqSet } from "@/lib/domain/enums";

export async function createFaqAction(
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const res = await createFaq(input);
    invalidate(TAG.faqs);
    return res;
  });
}

export async function updateFaqAction(
  id: number,
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const res = await updateFaq(validId, input);
    invalidate(TAG.faqs);
    return res;
  });
}

export async function deleteFaqAction(
  id: number,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const res = await deleteFaq(validId);
    invalidate(TAG.faqs);
    return res;
  });
}

export async function reorderFaqsAction(
  setKey: FaqSet,
  ids: number[],
): Promise<ActionResult<{ count: number }>> {
  return runAction(async () => {
    const validSet = z.enum(FAQ_SETS).parse(setKey);
    const validIds = z.array(z.number().int().positive()).max(200).parse(ids);
    const res = await reorderFaqs(validSet, validIds);
    invalidate(TAG.faqs);
    return res;
  });
}
