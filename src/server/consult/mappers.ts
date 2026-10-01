import type { Service, Tier } from "@/lib/api/consult";
import type { IconName } from "@/components/icons/Icon";
import type { TierKey } from "@/lib/domain/enums";
import { loc } from "@/lib/domain/loc";
import type { ConsultServiceRow, ConsultTierRow } from "./queries";

const TIER_ORDER: Record<TierKey, number> = {
  essential: 0,
  detailed: 1,
  premium: 2,
};

export type ServiceCard = {
  key: ConsultServiceRow["key"];
  slug: string;
  name: string;
  hi: string;
  icon: IconName;
  line: string;
  price: number;
  dur: string;
  modesLine: string;
};

export function toService(
  row: ConsultServiceRow,
  tiers: ConsultTierRow[],
  locale: string,
): Service {
  const serviceTiers = tiers
    .filter((t) => t.serviceKey === row.key)
    .sort((a, b) => (TIER_ORDER[a.tierKey] ?? 0) - (TIER_ORDER[b.tierKey] ?? 0));

  const mappedTiers: Tier[] = serviceTiers.map((t) => ({
    k: t.tierKey,
    t: loc({ en: t.titleEn, hi: t.titleHi }, locale),
    price: t.priceInr,
    mins: t.mins,
    rec: t.recommended ? 1 : undefined,
    inc: t.inclusions.map((i) => loc(i, locale)),
  }));

  const covered: [string, string, string][] = (row.content.covered ?? []).map((c) => [
    c.icon,
    loc(c.t, locale),
    loc(c.d, locale),
  ]);

  const samples: [string, string][] = (row.content.samples ?? []).map((s) => [
    s.kind,
    loc(s.cap, locale),
  ]);

  return {
    key: row.key,
    slug: row.slug,
    name: row.nameEn,
    hi: row.nameHi,
    icon: row.icon as IconName,
    line: loc(row.content.line, locale),
    modes: row.modes,
    guarantee: row.guarantee ? true : undefined,
    deliver: loc(row.content.deliver, locale),
    get: loc(row.content.get, locale),
    covered,
    tiers: mappedTiers as [Tier, Tier, Tier],
    samples,
  };
}

export function toServiceCard(
  row: ConsultServiceRow,
  tiers: ConsultTierRow[],
  locale: string,
): ServiceCard {
  const essential =
    tiers.find((t) => t.serviceKey === row.key && t.tierKey === "essential") ??
    tiers.find((t) => t.serviceKey === row.key);

  const price = essential?.priceInr ?? 0;
  const dur = `${essential?.mins ?? 0} min`;

  return {
    key: row.key,
    slug: row.slug,
    name: row.nameEn,
    hi: row.nameHi,
    icon: row.icon as IconName,
    line: loc(row.content.line, locale),
    price,
    dur,
    modesLine: loc(row.content.modesLine, locale),
  };
}
