"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import { HOME_SECTIONS } from "@/lib/domain/enums";
import type { HeroSlideText } from "@/lib/domain/types";
import type { HomeSection } from "@/lib/domain/enums";
import type { Loc } from "@/lib/domain/loc";
import {
  updateSections,
  updateHero,
  updateAnnouncement,
} from "./admin";

const locSchema = z.object({
  en: z.string().max(4000),
  hi: z.string().max(4000),
});

const heroSlideSchema = z.object({
  eyebrow: locSchema,
  l1: locSchema,
  l2: locSchema,
  sub: locSchema,
  body: locSchema,
  cta1: locSchema,
  cta2: locSchema,
  mediaId: z.number().int().positive().nullable(),
});

const heroSchema = z
  .object({
    s1: heroSlideSchema,
    s2: heroSlideSchema,
    s3: heroSlideSchema,
  })
  .nullable();

const announcementItemSchema = z.object({
  text: locSchema,
  href: z.string().max(500).nullable(),
});

const announcementSchema = z.array(announcementItemSchema).max(5).nullable();

export async function updateSectionsAction(
  map: Record<HomeSection, boolean>,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const validated = z
      .record(z.enum(HOME_SECTIONS), z.boolean())
      .parse(map);
    await updateSections(validated);
    invalidate(TAG.settings);
    return { ok: true };
  });
}

export async function updateHeroAction(
  slides: Record<"s1" | "s2" | "s3", HeroSlideText> | null,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const validated = heroSchema.parse(slides);
    await updateHero(validated);
    invalidate(TAG.settings);
    return { ok: true };
  });
}

export async function updateAnnouncementAction(
  items: { text: Loc; href: string | null }[] | null,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const validated = announcementSchema.parse(items);
    await updateAnnouncement(validated);
    invalidate(TAG.settings);
    return { ok: true };
  });
}
