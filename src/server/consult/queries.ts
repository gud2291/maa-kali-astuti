import "server-only";
import { eq, inArray, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { services, serviceTiers } from "@/server/db/schema/content";
import { cached, TAG } from "@/server/cache";
import type { ServiceKey, TierKey, ModeKey } from "@/lib/domain/enums";
import type { ServiceContent } from "@/lib/domain/types";
import type { Loc } from "@/lib/domain/loc";

export type ConsultServiceRow = {
  key: ServiceKey;
  slug: string;
  nameEn: string;
  nameHi: string;
  icon: string;
  modes: ModeKey[];
  guarantee: boolean;
  content: ServiceContent;
  sort: number;
};

export type ConsultTierRow = {
  id: number;
  serviceKey: ServiceKey;
  tierKey: TierKey;
  titleEn: string;
  titleHi: string;
  priceInr: number;
  mins: number;
  recommended: boolean;
  inclusions: Loc[];
};

export type ConsultRows = {
  services: ConsultServiceRow[];
  tiers: ConsultTierRow[];
};

async function fetchConsultRows(): Promise<ConsultRows> {
  const serviceRows = await db
    .select({
      key: services.key,
      slug: services.slug,
      nameEn: services.nameEn,
      nameHi: services.nameHi,
      icon: services.icon,
      modes: services.modes,
      guarantee: services.guarantee,
      content: services.content,
      sort: services.sort,
    })
    .from(services)
    .where(eq(services.visible, true))
    .orderBy(asc(services.sort));

  if (serviceRows.length === 0) {
    return { services: [], tiers: [] };
  }

  const tierRows = await db
    .select({
      id: serviceTiers.id,
      serviceKey: serviceTiers.serviceKey,
      tierKey: serviceTiers.tierKey,
      titleEn: serviceTiers.titleEn,
      titleHi: serviceTiers.titleHi,
      priceInr: serviceTiers.priceInr,
      mins: serviceTiers.mins,
      recommended: serviceTiers.recommended,
      inclusions: serviceTiers.inclusions,
    })
    .from(serviceTiers)
    .where(
      inArray(
        serviceTiers.serviceKey,
        serviceRows.map((s) => s.key),
      ),
    );

  return {
    services: serviceRows,
    tiers: tierRows,
  };
}

export const getConsultRows: () => Promise<ConsultRows> = cached(
  "consult-rows",
  fetchConsultRows,
  () => [TAG.consult],
);
