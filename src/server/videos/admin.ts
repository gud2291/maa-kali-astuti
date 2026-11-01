import "server-only";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { videos } from "@/server/db/schema/content";
import { requireAdmin } from "@/server/auth/guards";
import { audit, diffOf } from "@/server/audit";
import { AppError } from "@/server/result";
import { writeSetting } from "@/server/settings/admin";
import {
  videoSchema,
  videoCategoriesSchema,
  type VideoInput,
  type VideoCategoryItem,
} from "@/lib/validation/content";
import type { VideoKind } from "@/lib/domain/enums";

export type VideoAdminRow = typeof videos.$inferSelect;

function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
  );
  return match ? match[1]! : null;
}

export async function youtubeLookup(
  urlOrId: string,
): Promise<{ youtubeId: string; title?: string; thumbnail: string }> {
  await requireAdmin("content.edit");

  const youtubeId = extractYoutubeId(urlOrId);
  if (!youtubeId) {
    throw new AppError("VALIDATION", "Invalid YouTube link or 11-character video ID");
  }

  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${youtubeId}`,
  )}&format=json`;

  let title: string | undefined;
  let thumbnail = `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;

  try {
    const res = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as { title?: string; thumbnail_url?: string };
      title = data.title;
      if (data.thumbnail_url) {
        thumbnail = data.thumbnail_url;
      }
    }
  } catch {
    // Title is optional on failure
  }

  return { youtubeId, title, thumbnail };
}

export async function listVideosAdmin(kind?: VideoKind): Promise<VideoAdminRow[]> {
  await requireAdmin("content.edit");

  const query = db
    .select()
    .from(videos);

  if (kind) {
    return query
      .where(eq(videos.kind, kind))
      .orderBy(asc(videos.sort), desc(videos.createdAt));
  }

  return query.orderBy(asc(videos.kind), asc(videos.sort), desc(videos.createdAt));
}

export async function createVideo(input: unknown): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");
  const data = videoSchema.parse(input);

  const [maxRow] = await db
    .select({ maxSort: sql<number | null>`max(${videos.sort})`.mapWith(Number) })
    .from(videos)
    .where(eq(videos.kind, data.kind));

  const nextSort = (maxRow?.maxSort ?? -1) + 1;

  const [inserted] = await db
    .insert(videos)
    .values({
      kind: data.kind,
      youtubeId: data.youtubeId ?? null,
      category: data.category,
      titleEn: data.titleEn,
      titleHi: data.titleHi,
      descEn: data.descEn ?? null,
      descHi: data.descHi ?? null,
      duration: data.duration,
      publishedOn: data.publishedOn ?? null,
      featured: data.featured,
      visible: data.visible,
      sort: nextSort,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: videos.id });

  if (!inserted) {
    throw new AppError("INTERNAL", "Failed to create video");
  }

  await audit({
    actorId: admin.id,
    action: "video.create",
    entity: "video",
    entityId: inserted.id,
    summary: `Created ${data.kind} video: "${data.titleEn}"`,
  });

  return inserted;
}

export async function updateVideo(id: number, input: unknown): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");
  const data = videoSchema.parse(input);

  const [existing] = await db
    .select()
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", "Video not found");
  }

  const patch = {
    kind: data.kind,
    youtubeId: data.youtubeId ?? null,
    category: data.category,
    titleEn: data.titleEn,
    titleHi: data.titleHi,
    descEn: data.descEn ?? null,
    descHi: data.descHi ?? null,
    duration: data.duration,
    publishedOn: data.publishedOn ?? null,
    featured: data.featured,
    visible: data.visible,
    updatedAt: new Date(),
  };

  await db
    .update(videos)
    .set(patch)
    .where(eq(videos.id, id));

  const diff = diffOf(
    existing as Record<string, unknown>,
    patch as Record<string, unknown>,
    Object.keys(patch) as (keyof typeof patch)[],
  );

  await audit({
    actorId: admin.id,
    action: "video.update",
    entity: "video",
    entityId: id,
    summary: `Updated video #${id}: "${data.titleEn}"`,
    diff,
  });

  return { id };
}

export async function deleteVideo(id: number): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");

  const [existing] = await db
    .select()
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", "Video not found");
  }

  await db.delete(videos).where(eq(videos.id, id));

  await audit({
    actorId: admin.id,
    action: "video.delete",
    entity: "video",
    entityId: id,
    summary: `Deleted video #${id}: "${existing.titleEn}"`,
  });

  return { id };
}

export async function reorderVideos(
  kind: VideoKind,
  ids: number[],
): Promise<{ count: number }> {
  const admin = await requireAdmin("content.edit");

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!;
    await db
      .update(videos)
      .set({ sort: i, updatedAt: new Date() })
      .where(and(eq(videos.id, id), eq(videos.kind, kind)));
  }

  await audit({
    actorId: admin.id,
    action: "video.reorder",
    entity: "video",
    entityId: kind,
    summary: `Reordered ${ids.length} ${kind} videos`,
  });

  return { count: ids.length };
}

export async function updateVideoCategories(
  list: unknown,
): Promise<{ ok: boolean }> {
  const admin = await requireAdmin("content.edit");
  const categories = videoCategoriesSchema.parse(list);

  await writeSetting("videos", { categories }, admin);

  return { ok: true };
}
