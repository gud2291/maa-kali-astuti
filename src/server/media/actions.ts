"use server";

import { runAction, AppError } from "@/server/result";
import { clientIp } from "@/server/request";
import { rateLimit } from "@/server/rate-limit";
import { requireAdmin } from "@/server/auth/guards";
import { createUploadSchema, confirmUploadSchema } from "@/lib/validation/media";
import {
  createUpload,
  confirmUpload,
  isCustomerPurpose,
  getMediaPurpose,
} from "@/server/media/service";
import type { ActionResult } from "@/lib/domain/errors";
import type { MediaRef } from "@/lib/domain/media";

export async function createUploadAction(
  input: unknown,
): Promise<
  ActionResult<{
    mediaId: number;
    uploads: { w: number; url: string; type: string }[];
    claimKey: string | null;
  }>
> {
  return runAction(async () => {
    const data = createUploadSchema.parse(input);

    if (isCustomerPurpose(data.purpose)) {
      const ip = await clientIp();
      await rateLimit("upload:ip", ip, 20, 3600);
      return await createUpload(data, { userId: null });
    }

    const admin = await requireAdmin("media.upload");
    return await createUpload(data, { userId: admin.id });
  });
}

export async function confirmUploadAction(
  input: unknown,
): Promise<ActionResult<{ id: number; ref: MediaRef | null }>> {
  return runAction(async () => {
    const data = confirmUploadSchema.parse(input);

    const purpose = await getMediaPurpose(data.mediaId);
    if (!purpose) {
      throw new AppError("UPLOAD_INVALID");
    }

    if (isCustomerPurpose(purpose)) {
      const ip = await clientIp();
      await rateLimit("upload:ip", ip, 20, 3600);
      return await confirmUpload(data.mediaId, { userId: null, admin: false });
    }

    const admin = await requireAdmin("media.upload");
    return await confirmUpload(data.mediaId, { userId: admin.id, admin: true });
  });
}
