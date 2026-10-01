import "server-only";
import { eq, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { videos } from "@/server/db/schema/content";
import { cached, TAG } from "@/server/cache";
import type { VideoKind } from "@/lib/domain/enums";

export type VideoRow = {
  id: number;
  kind: VideoKind;
  youtubeId: string | null;
  legacyKey: string | null;
  category: string;
  titleEn: string;
  titleHi: string;
  descEn: string | null;
  descHi: string | null;
  duration: string;
  publishedOn: string | null;
  motif: string | null;
  featured: boolean;
  sort: number;
};

async function fetchVideoRows(): Promise<VideoRow[]> {
  return db
    .select({
      id: videos.id,
      kind: videos.kind,
      youtubeId: videos.youtubeId,
      legacyKey: videos.legacyKey,
      category: videos.category,
      titleEn: videos.titleEn,
      titleHi: videos.titleHi,
      descEn: videos.descEn,
      descHi: videos.descHi,
      duration: videos.duration,
      publishedOn: videos.publishedOn,
      motif: videos.motif,
      featured: videos.featured,
      sort: videos.sort,
    })
    .from(videos)
    .where(eq(videos.visible, true))
    .orderBy(asc(videos.kind), asc(videos.sort));
}

export const getVideoRows: () => Promise<VideoRow[]> = cached(
  "video-rows",
  fetchVideoRows,
  () => [TAG.videos],
);
