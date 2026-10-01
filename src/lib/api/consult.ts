import "server-only";
import consultData from "@/lib/data/consult.json";
import type { IconName } from "@/components/icons/Icon";
import { getConsultRows } from "@/server/consult/queries";
import { toService, toServiceCard, type ServiceCard } from "@/server/consult/mappers";
import { getTestimonialRows } from "@/server/testimonials/queries";
import { getFaqRows } from "@/server/faqs/queries";
import { loc } from "@/lib/domain/loc";
import type { FAQ_SETS, ServiceKey, TierKey, ModeKey } from "@/lib/domain/enums";

export type { ServiceKey, TierKey, ModeKey, ServiceCard };

export type Tier = { k: TierKey; t: string; price: number; mins: number; rec?: number; inc: string[] };

export type Service = {
  key: ServiceKey;
  slug: string;
  name: string;
  hi: string;
  icon: IconName;
  line: string;
  modes: ModeKey[];
  guarantee?: boolean;
  deliver: string;
  get: string;
  /** [icon, title, description] */
  covered: [string, string, string][];
  tiers: [Tier, Tier, Tier];
  /** [report page kind, caption] */
  samples: [string, string][];
};

export type Mode = { t: string; icon: IconName };
export type Testimonial = { q: string; n: string; c: string; s: string };
export type FaqSet = (typeof FAQ_SETS)[number];

export async function getServices(locale = "en"): Promise<Service[]> {
  const { services, tiers } = await getConsultRows();
  return services.map((s) => toService(s, tiers, locale));
}

/** By route slug (`kundali-reading`) or design key (`kundali`). */
export async function getService(slugOrKey: string, locale = "en"): Promise<Service | null> {
  const { services, tiers } = await getConsultRows();
  const s = services.find((row) => row.slug === slugOrKey || row.key === slugOrKey);
  if (!s) return null;
  return toService(s, tiers, locale);
}

export async function getServiceCards(locale = "en"): Promise<ServiceCard[]> {
  const { services, tiers } = await getConsultRows();
  return services.map((s) => toServiceCard(s, tiers, locale));
}

/** Consultation modes (call, video, WhatsApp, report) with their icons. */
export async function getModes(): Promise<Record<ModeKey, Mode>> {
  const m = consultData.modes;
  return Object.fromEntries(
    (Object.keys(m) as ModeKey[]).map((k) => [k, { t: m[k].t, icon: m[k].ic as IconName }]),
  ) as Record<ModeKey, Mode>;
}

/** "How it works" steps: [icon, title, description]. */
export async function getConsultSteps(): Promise<[IconName, string, string][]> {
  return consultData.steps as [IconName, string, string][];
}

export async function getTestimonials(locale = "en"): Promise<Testimonial[]> {
  const rows = await getTestimonialRows();
  return rows.map((r) => ({
    q: loc({ en: r.quoteEn, hi: r.quoteHi }, locale),
    n: r.name,
    c: r.city ?? "",
    s: r.tag ?? "",
  }));
}

/** One FaqList set: [question, answer] pairs. */
export async function getFaq(set: FaqSet, locale = "en"): Promise<[string, string][]> {
  const rows = await getFaqRows(set);
  return rows.map((r) => [
    loc({ en: r.qEn, hi: r.qHi }, locale),
    loc({ en: r.aEn, hi: r.aHi }, locale),
  ]);
}

/* ---------- display helpers shared by the listing, the detail page and booking ---------- */
export { isReport, recTier } from "@/lib/core/services";
