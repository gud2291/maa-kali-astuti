/* THE BACKEND SEAM for consultations (services, tiers, process steps, testimonials, FAQ sets).
   Components call these async getters and never import the JSON themselves. Today they read
   src/lib/data (services.json = mka-core SERVICES ⊕ mka-astro SVC, consult.json = MODES/STEPS);
   in phase B they become CMS / DB reads with the same signatures. */
import servicesData from "@/lib/data/services.json";
import consultData from "@/lib/data/consult.json";
import testimonialsData from "@/lib/data/testimonials.json";
import faqData from "@/lib/data/faq.json";
import type { IconName } from "@/components/icons/Icon";

export type ServiceKey = "kundali" | "palm" | "tarot" | "numerology";
export type TierKey = "essential" | "detailed" | "premium";
export type ModeKey = keyof typeof consultData.modes;

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
export type FaqSet = keyof typeof faqData;

const SERVICES = servicesData as unknown as readonly Service[];

export async function getServices(): Promise<Service[]> {
  return SERVICES.slice();
}

/** By route slug (`kundali-reading`) or design key (`kundali`). */
export async function getService(slugOrKey: string): Promise<Service | null> {
  return SERVICES.find((s) => s.slug === slugOrKey || s.key === slugOrKey) ?? null;
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

export async function getTestimonials(): Promise<Testimonial[]> {
  return (testimonialsData as Testimonial[]).slice();
}

/** One FaqList set: [question, answer] pairs. */
export async function getFaq(set: FaqSet): Promise<[string, string][]> {
  return faqData[set] as [string, string][];
}

/* ---------- display helpers shared by the listing, the detail page and booking ---------- */
export { isReport, recTier } from "@/lib/core/services";
