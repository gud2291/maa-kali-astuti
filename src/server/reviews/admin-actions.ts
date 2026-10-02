"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import {
  approveReview,
  rejectReview,
  setShowOnHome,
  deleteReview,
} from "./admin";

export async function approveReviewAction(
  rawId: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const id = z.number().int().parse(rawId);
    const { productId } = await approveReview(id);
    invalidate(
      TAG.catalog,
      TAG.product(productId),
      TAG.productReviews(productId),
      TAG.reviews,
    );
    return { success: true as const };
  });
}

export async function rejectReviewAction(
  rawId: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const id = z.number().int().parse(rawId);
    const { productId } = await rejectReview(id);
    invalidate(
      TAG.catalog,
      TAG.product(productId),
      TAG.productReviews(productId),
      TAG.reviews,
    );
    return { success: true as const };
  });
}

export async function setShowOnHomeAction(
  rawId: unknown,
  rawOn: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const id = z.number().int().parse(rawId);
    const on = z.boolean().parse(rawOn);
    const { productId } = await setShowOnHome(id, on);
    invalidate(
      TAG.catalog,
      TAG.product(productId),
      TAG.productReviews(productId),
      TAG.reviews,
    );
    return { success: true as const };
  });
}

export async function deleteReviewAction(
  rawId: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const id = z.number().int().parse(rawId);
    const { productId } = await deleteReview(id);
    invalidate(
      TAG.catalog,
      TAG.product(productId),
      TAG.productReviews(productId),
      TAG.reviews,
    );
    return { success: true as const };
  });
}
