"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import {
  createVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
  updateVideoCategories,
  youtubeLookup,
} from "./admin";
import { VIDEO_KINDS, type VideoKind } from "@/lib/domain/enums";

export async function lookupYoutubeAction(
  urlOrId: string,
): Promise<ActionResult<{ youtubeId: string; title?: string; thumbnail: string }>> {
  return runAction(async () => {
    const valid = z.string().trim().min(1).parse(urlOrId);
    return youtubeLookup(valid);
  });
}

export async function createVideoAction(
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const res = await createVideo(input);
    invalidate(TAG.videos);
    return res;
  });
}

export async function updateVideoAction(
  id: number,
  input: unknown,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const res = await updateVideo(validId, input);
    invalidate(TAG.videos);
    return res;
  });
}

export async function deleteVideoAction(
  id: number,
): Promise<ActionResult<{ id: number }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const res = await deleteVideo(validId);
    invalidate(TAG.videos);
    return res;
  });
}

export async function reorderVideosAction(
  kind: VideoKind,
  ids: number[],
): Promise<ActionResult<{ count: number }>> {
  return runAction(async () => {
    const validKind = z.enum(VIDEO_KINDS).parse(kind);
    const validIds = z.array(z.number().int().positive()).max(200).parse(ids);
    const res = await reorderVideos(validKind, validIds);
    invalidate(TAG.videos);
    return res;
  });
}

export async function updateVideoCategoriesAction(
  list: unknown,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    const res = await updateVideoCategories(list);
    invalidate(TAG.videos, TAG.settings);
    return res;
  });
}
