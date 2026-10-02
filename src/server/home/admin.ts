import "server-only";

import { inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import { media } from "@/server/db/schema/core";
import { requireAdmin } from "@/server/auth/guards";
import { writeSetting } from "@/server/settings/admin";
import { getSetting } from "@/server/settings/queries";
import { toMediaRef } from "@/server/media/refs";
import type { MediaRef } from "@/lib/domain/media";
import type { HeroSlideText } from "@/lib/domain/types";
import type { HomeSection } from "@/lib/domain/enums";
import type { Loc } from "@/lib/domain/loc";

export type HomeAdminData = {
  sections: Record<HomeSection, boolean>;
  hero: Record<"s1" | "s2" | "s3", HeroSlideText> | null;
  heroMedia: Record<number, MediaRef>;
  announcement: { items: { text: Loc; href: string | null }[] } | null;
};

export async function getHomeAdmin(): Promise<HomeAdminData> {
  await requireAdmin("content.edit");

  const [home, announcement] = await Promise.all([
    getSetting("home"),
    getSetting("announcement"),
  ]);

  const heroMedia: Record<number, MediaRef> = {};
  if (home.hero) {
    const mediaIds = [
      home.hero.s1.mediaId,
      home.hero.s2.mediaId,
      home.hero.s3.mediaId,
    ].filter((id): id is number => typeof id === "number" && id > 0);

    if (mediaIds.length > 0) {
      const rows = await db
        .select()
        .from(media)
        .where(inArray(media.id, mediaIds));

      for (const row of rows) {
        if (row.status === "ready") {
          heroMedia[row.id] = toMediaRef(row);
        }
      }
    }
  }

  return {
    sections: home.sections,
    hero: home.hero,
    heroMedia,
    announcement,
  };
}

export async function updateSections(
  map: Record<HomeSection, boolean>,
): Promise<void> {
  const actor = await requireAdmin("content.edit");
  const current = await getSetting("home");
  await writeSetting(
    "home",
    {
      ...current,
      sections: map,
    },
    actor,
  );
}

export async function updateHero(
  slides: Record<"s1" | "s2" | "s3", HeroSlideText> | null,
): Promise<void> {
  const actor = await requireAdmin("content.edit");
  const current = await getSetting("home");
  await writeSetting(
    "home",
    {
      ...current,
      hero: slides,
    },
    actor,
  );
}

export async function updateAnnouncement(
  items: { text: Loc; href: string | null }[] | null,
): Promise<void> {
  const actor = await requireAdmin("content.edit");
  const val = items ? { items } : null;
  await writeSetting("announcement", val, actor);
}
