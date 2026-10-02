"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from "./admin";

export async function createTestimonialAction(
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const res = await createTestimonial(input);
    invalidate(TAG.testimonials);
    return res;
  });
}

export async function updateTestimonialAction(
  id: number,
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const res = await updateTestimonial(validId, input);
    invalidate(TAG.testimonials);
    return res;
  });
}

export async function deleteTestimonialAction(
  id: number,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const res = await deleteTestimonial(validId);
    invalidate(TAG.testimonials);
    return res;
  });
}

export async function reorderTestimonialsAction(
  ids: number[],
): Promise<ActionResult<{ count: number }>> {
  return runAction(async () => {
    const validIds = z.array(z.number().int().positive()).max(200).parse(ids);
    const res = await reorderTestimonials(validIds);
    invalidate(TAG.testimonials);
    return res;
  });
}
