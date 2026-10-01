"use server";

import { z } from "zod";
import { runAction } from "@/server/result";
import { TAG, invalidate } from "@/server/cache";
import {
  createProduct,
  updateProduct,
  setProductStatus,
  duplicateProduct,
  adjustStock,
  deleteProduct,
  updateCategory,
} from "./admin";
import { productInputSchema } from "@/lib/validation/product";
import { categoryInputSchema } from "@/lib/validation/category";
import { CATEGORY_KEYS, PRODUCT_STATUS } from "@/lib/domain/enums";
import type { ActionResult } from "@/lib/domain/errors";
import type { CategoryKey } from "@/lib/domain/enums";

/* ── Product Action Schemas ──────────────────────────────────────────── */

const updateProductSchema = productInputSchema.and(
  z.object({
    id: z.string().min(1),
  }),
);

const setStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(PRODUCT_STATUS),
});

const duplicateSchema = z.object({
  id: z.string().min(1),
});

const adjustStockSchema = z.object({
  id: z.string().min(1),
  delta: z.number().int(),
  reason: z.string().trim().min(1, "Reason is required").max(200),
});

const deleteProductSchema = z.object({
  id: z.string().min(1),
});

const updateCategorySchema = categoryInputSchema.and(
  z.object({
    key: z.enum(CATEGORY_KEYS),
  }),
);

/* ── Product Actions ─────────────────────────────────────────────────── */

export async function createProductAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const data = productInputSchema.parse(input);
    const res = await createProduct(data);
    invalidate(TAG.catalog, TAG.product(res.id));
    return res;
  });
}

export async function updateProductAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const data = updateProductSchema.parse(input);
    const { id, ...rest } = data;
    const res = await updateProduct(id, rest);
    invalidate(TAG.catalog, TAG.product(id));
    return res;
  });
}

export async function setProductStatusAction(
  input: unknown,
): Promise<ActionResult<{ id: string; status: string }>> {
  return runAction(async () => {
    const { id, status } = setStatusSchema.parse(input);
    await setProductStatus(id, status);
    invalidate(TAG.catalog, TAG.product(id));
    return { id, status };
  });
}

export async function duplicateProductAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const { id } = duplicateSchema.parse(input);
    const res = await duplicateProduct(id);
    invalidate(TAG.catalog, TAG.product(res.id));
    return res;
  });
}

export async function adjustStockAction(
  input: unknown,
): Promise<ActionResult<{ id: string; stock: number }>> {
  return runAction(async () => {
    const { id, delta, reason } = adjustStockSchema.parse(input);
    const res = await adjustStock(id, delta, reason);
    invalidate(TAG.catalog, TAG.product(id));
    return res;
  });
}

export async function deleteProductAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const { id } = deleteProductSchema.parse(input);
    await deleteProduct(id);
    invalidate(TAG.catalog, TAG.product(id));
    return { id };
  });
}

/* ── Category Actions ────────────────────────────────────────────────── */

export async function updateCategoryAction(
  input: unknown,
): Promise<ActionResult<{ key: CategoryKey }>> {
  return runAction(async () => {
    const data = updateCategorySchema.parse(input);
    const { key, ...rest } = data;
    const res = await updateCategory(key, rest);
    invalidate(TAG.catalog);
    return res;
  });
}
