import "server-only";
import { eq, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { rituals } from "@/server/db/schema/content";
import { cached, TAG } from "@/server/cache";

export type RitualRow = {
  id: number;
  icon: string;
  nameEn: string;
  nameHi: string;
  lineEn: string;
  lineHi: string;
  sort: number;
};

async function fetchRitualRows(): Promise<RitualRow[]> {
  return db
    .select({
      id: rituals.id,
      icon: rituals.icon,
      nameEn: rituals.nameEn,
      nameHi: rituals.nameHi,
      lineEn: rituals.lineEn,
      lineHi: rituals.lineHi,
      sort: rituals.sort,
    })
    .from(rituals)
    .where(eq(rituals.visible, true))
    .orderBy(asc(rituals.sort));
}

export const getRitualRows: () => Promise<RitualRow[]> = cached(
  "ritual-rows",
  fetchRitualRows,
  () => [TAG.rituals],
);
