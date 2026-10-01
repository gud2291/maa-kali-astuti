import "server-only";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import { media } from "@/server/db/schema/core";
import { productMedia } from "@/server/db/schema/catalog";
import { env } from "@/server/env";
import { AppError } from "@/server/result";
import { randomToken, sha256Hex, safeEqualHex } from "@/server/ids";
import { presignPut, presignGet, headObject, deleteObject } from "@/server/storage/r2";
import { toMediaRef } from "@/server/media/refs";
import type { CreateUploadInput, UploadPurpose } from "@/lib/validation/media";
import {
  CUSTOMER_UPLOAD_PURPOSES,
} from "@/lib/validation/media";
import type { MediaRef } from "@/lib/domain/media";
import type { MediaVariant } from "@/lib/domain/types";

export function isCustomerPurpose(purpose: UploadPurpose): boolean {
  return (CUSTOMER_UPLOAD_PURPOSES as readonly string[]).includes(purpose);
}

function purposeConfig(purpose: UploadPurpose): {
  bucket: "public" | "private";
  kind: "image" | "pdf";
  maxBytesPerFile: number;
} {
  if (purpose === "report") {
    return { bucket: "private", kind: "pdf", maxBytesPerFile: 10 * 1024 * 1024 };
  }
  if (purpose === "palm") {
    return { bucket: "private", kind: "image", maxBytesPerFile: 2 * 1024 * 1024 };
  }
  return { bucket: "public", kind: "image", maxBytesPerFile: 2 * 1024 * 1024 };
}

export async function createUpload(
  input: CreateUploadInput,
  actor: { userId: number | null },
): Promise<{
  mediaId: number;
  uploads: { w: number; url: string; type: string }[];
  claimKey: string | null;
}> {
  const { bucket, kind, maxBytesPerFile } = purposeConfig(input.purpose);

  for (const f of input.files) {
    if (f.size > maxBytesPerFile) {
      throw new AppError("UPLOAD_INVALID");
    }
  }

  const now = new Date();
  const yyyy = now.getUTCFullYear().toString();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const uuid = randomUUID();

  const isCustomer = isCustomerPurpose(input.purpose);
  const claimKey = isCustomer ? randomToken(24) : null;
  const claimHash = claimKey ? sha256Hex(claimKey) : null;

  const variants: MediaVariant[] = [];
  const uploads: { w: number; url: string; type: string }[] = [];
  const r2Bucket = bucket === "public" ? env.R2_BUCKET_PUBLIC! : env.R2_BUCKET_PRIVATE!;

  for (const f of input.files) {
    let key: string;
    if (bucket === "public") {
      key = `pub/${input.purpose}/${yyyy}/${mm}/${uuid}-${f.w}.webp`;
    } else {
      const ext = kind === "pdf" ? "pdf" : "jpg";
      key = `prv/${input.purpose}/${yyyy}/${mm}/${uuid}.${ext}`;
    }

    let h: number;
    if (input.height && input.width) {
      h = Math.round((f.w / input.width) * input.height);
    } else if (input.height) {
      h = input.height;
    } else {
      h = f.w;
    }

    variants.push({ w: f.w, h, key, bytes: f.size });

    const url = await presignPut({
      bucket: r2Bucket,
      key,
      contentType: f.type,
      contentLength: f.size,
      expiresSec: 300,
    });

    uploads.push({ w: f.w, url, type: f.type });
  }

  const [inserted] = await db
    .insert(media)
    .values({
      kind,
      bucket,
      purpose: input.purpose,
      status: "pending",
      variants,
      width: input.width ?? null,
      height: input.height ?? null,
      blur: input.blur ?? null,
      mime: input.files[0]?.type ?? "application/octet-stream",
      claimHash,
      uploadedBy: actor.userId ?? null,
    })
    .returning({ id: media.id });

  if (!inserted) {
    throw new AppError("INTERNAL");
  }

  return {
    mediaId: inserted.id,
    uploads,
    claimKey,
  };
}

export async function confirmUpload(
  mediaId: number,
  actor: { userId: number | null; admin: boolean },
): Promise<{ id: number; ref: MediaRef | null }> {
  const rows = await db.select().from(media).where(eq(media.id, mediaId));
  const row = rows[0];
  if (!row) {
    throw new AppError("UPLOAD_INVALID");
  }

  if (row.status !== "pending") {
    throw new AppError("UPLOAD_INVALID");
  }

  const purpose = row.purpose as UploadPurpose;
  const isCustomer = isCustomerPurpose(purpose);

  if (isCustomer) {
    if (!row.claimHash) {
      throw new AppError("UPLOAD_INVALID");
    }
  } else {
    if (!actor.admin) {
      throw new AppError("FORBIDDEN");
    }
  }

  const { bucket, maxBytesPerFile } = purposeConfig(purpose);
  const r2Bucket = bucket === "public" ? env.R2_BUCKET_PUBLIC! : env.R2_BUCKET_PRIVATE!;
  const variants = row.variants ?? [];
  let valid = variants.length > 0;

  if (valid) {
    for (const v of variants) {
      try {
        const head = await headObject(r2Bucket, v.key);
        if (!head) {
          valid = false;
          break;
        }
        if (head.size <= 0 || head.size > maxBytesPerFile) {
          valid = false;
          break;
        }
        if (head.contentType !== row.mime) {
          valid = false;
          break;
        }
      } catch {
        valid = false;
        break;
      }
    }
  }

  if (!valid) {
    for (const v of variants) {
      await deleteObject(r2Bucket, v.key).catch(() => {});
    }
    await db.delete(media).where(eq(media.id, mediaId));
    throw new AppError("UPLOAD_INVALID");
  }

  await db
    .update(media)
    .set({ status: "ready" })
    .where(eq(media.id, mediaId));

  const ref =
    bucket === "public"
      ? toMediaRef({
          id: row.id,
          variants,
          width: row.width,
          height: row.height,
          blur: row.blur,
          altEn: row.altEn,
          altHi: row.altHi,
        })
      : null;

  return { id: row.id, ref };
}

export async function attachMedia(
  ids: number[],
  owner: { type: string; id: string },
): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(media)
    .set({ ownerType: owner.type, ownerId: owner.id })
    .where(inArray(media.id, ids));
}

export async function claimMedia(
  items: { mediaId: number; claimKey: string }[],
  owner: { type: string; id: string },
): Promise<number[]> {
  if (items.length === 0) return [];
  const ids = items.map((i) => i.mediaId);
  const rows = await db.select().from(media).where(inArray(media.id, ids));

  if (rows.length !== items.length) {
    throw new AppError("UPLOAD_INVALID");
  }

  for (const item of items) {
    const row = rows.find((r) => r.id === item.mediaId);
    if (!row) {
      throw new AppError("UPLOAD_INVALID");
    }
    if (row.status !== "ready") {
      throw new AppError("UPLOAD_INVALID");
    }
    if (row.ownerType != null || row.ownerId != null) {
      throw new AppError("UPLOAD_INVALID");
    }
    if (!row.claimHash) {
      throw new AppError("UPLOAD_INVALID");
    }
    const hash = sha256Hex(item.claimKey);
    if (!safeEqualHex(hash, row.claimHash)) {
      throw new AppError("UPLOAD_INVALID");
    }
  }

  for (const item of items) {
    await db
      .update(media)
      .set({
        ownerType: owner.type,
        ownerId: owner.id,
        claimHash: null,
      })
      .where(eq(media.id, item.mediaId));
  }

  return ids;
}

export async function deleteMedia(id: number): Promise<void> {
  const rows = await db.select().from(media).where(eq(media.id, id));
  const row = rows[0];
  if (!row) return;

  await db.delete(productMedia).where(eq(productMedia.mediaId, id));

  const { bucket } = purposeConfig(row.purpose as UploadPurpose);
  const r2Bucket = bucket === "public" ? env.R2_BUCKET_PUBLIC : env.R2_BUCKET_PRIVATE;
  if (r2Bucket && row.variants) {
    for (const v of row.variants) {
      await deleteObject(r2Bucket, v.key).catch(() => {});
    }
  }

  await db.delete(media).where(eq(media.id, id));
}

export async function signedPrivateUrl(
  mediaId: number,
  filename?: string,
): Promise<string> {
  const rows = await db.select().from(media).where(eq(media.id, mediaId));
  const row = rows[0];
  if (!row) {
    throw new AppError("NOT_FOUND");
  }
  if (row.bucket !== "private") {
    throw new AppError("UPLOAD_INVALID");
  }
  if (row.status !== "ready") {
    throw new AppError("NOT_FOUND");
  }
  const key = row.variants[0]?.key;
  if (!key) {
    throw new AppError("NOT_FOUND");
  }
  return await presignGet({
    bucket: env.R2_BUCKET_PRIVATE!,
    key,
    expiresSec: 600,
    filename,
  });
}

export async function getMediaPurpose(
  mediaId: number,
): Promise<UploadPurpose | null> {
  const rows = await db
    .select({ purpose: media.purpose })
    .from(media)
    .where(eq(media.id, mediaId));
  return (rows[0]?.purpose as UploadPurpose) ?? null;
}
