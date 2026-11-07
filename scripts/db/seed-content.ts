import type { ProductContent, Loc } from "../../src/lib/domain/types";
import { EMPTY_PRODUCT_CONTENT } from "../../src/lib/domain/types";
import type { Product } from "../../src/types/product";
import { amuletContent } from "./amulet-content";
import { attarContent } from "./attar-content";

const L = (s: string): Loc => ({ en: s, hi: "" });

export type RudrakshaInfo = {
  deity: string;
  planet: string;
  intent: string;
  ik: string;
  mantra: string;
  price: number;
  mrp: number;
};

const BRACELET_STONE_MEANINGS: Record<string, string> = {
  pyrite: "Wealth & Abundance",
  citrine: "Success & Joy",
  jade: "Prosperity & Harmony",
  tourmaline: "Negative Energy Protection",
  tiger: "Courage & Focus",
  rose: "Love & Relationships",
  amethyst: "Intuition & Peace",
  chakra: "Chakra Balancing",
  quartz: "Master Healer & Clarity",
  lapis: "Wisdom & Truth",
  moon: "Emotional Balance & Intuition",
  garnet: "Passion & Energy",
  blood: "Vitality & Strength",
  jasper: "Grounding & Stability",
  malachite: "Transformation & Protection",
};

const AMULET_MEANINGS: Record<string, string> = {
  "a-bagla": "Victory & Protection",
  "a-hanuman": "Courage & Sankat Mochan",
  "a-durga": "Universal Divine Shield",
  "a-kali": "Destroyer of Negativity & Dark Forces",
  "a-vidya": "Supreme Occult Knowledge & Power",
  "a-bhairav": "Fearlessness & Fierce Protection",
  "a-child": "Balamukhi / Buri Nazar Kavach",
};

export function productContentFor(
  p: Pick<Product, "id" | "name" | "intent"> & Partial<Product>,
  rudraksha: Record<string, RudrakshaInfo>,
): ProductContent {
  if (p.id === "nag12") {
    return {
      description: L(
        "Bring home the divine blessings and powerful protective energies of the Hand-Energized Pure Copper 12 Nag (Set of 12 Small Serpents). Skillfully crafted from high-quality copper and personally energized through powerful traditional rituals, this sacred set is designed to channel positive energies into your living space.",
      ),
      benefits: [
        L("Attracts Wealth & Prosperity: Invites financial growth, abundance, and endless prosperity into your life and business."),
        L("Protection & Victory Over Enemies: Acts as a powerful shield against negative energies, evil eye, and hidden adversaries, ensuring victory over competitors."),
        L("Success in Legal Matters: Believed to support favorable outcomes in ongoing court cases and legal litigations."),
        L("Health & Healing: Traditionally associated with providing relief from chronic diseases and promoting overall well-being and vitality."),
      ],
      howToWear: L(""),
      specs: [
        { k: L("Material"), v: L("100% Pure Copper") },
        { k: L("Quantity"), v: L("Set of 12 Small Energized Nagas") },
        { k: L("Energization"), v: L("Hand-energized and ritually consecrated for maximum spiritual benefit.") },
        { k: L("Ideal For"), v: L("Home temples, lockers (Tijori), offices, or as a powerful Vastu remedy.") },
      ],
      placement: [L("Home temple"), L("Tijori (locker)"), L("Office")],
      certificateMediaId: null,
      youtubeId: null,
    };
  }

  if (p.id === "havan") {
    return {
      description: L(
        "Bitter Havan Packet – 100 grams. Specifically crafted to ward off deep negativity, evil eye, and stagnant energies immediately upon burning in the house / premises.",
      ),
      benefits: [],
      howToWear: L(""),
      specs: [],
      placement: [],
      certificateMediaId: null,
      youtubeId: null,
    };
  }

  const supplied = amuletContent(p.id) ?? attarContent(p.id);
  if (supplied) return supplied;

  if (p.id.startsWith("a-")) {
    const meaning = AMULET_MEANINGS[p.id] ?? p.intent;
    return {
      description: L(
        "Handmade on authentic Bhojpatra and ritually energized at an auspicious time (Muhurat) during powerful Mahapuja. Encased in a consecrated copper tabiz (amulet capsule).",
      ),
      benefits: [L(meaning)],
      howToWear: L(""),
      specs: [],
      placement: [],
      certificateMediaId: null,
      youtubeId: null,
    };
  }

  if (p.id.startsWith("b-")) {
    const meaning = (p.stone && BRACELET_STONE_MEANINGS[p.stone]) ? BRACELET_STONE_MEANINGS[p.stone] : p.intent;
    return {
      description: L(`${p.name} — ${meaning}.`),
      benefits: [L(meaning)],
      howToWear: L(""),
      specs: [],
      placement: [],
      certificateMediaId: null,
      youtubeId: null,
    };
  }

  if (p.id === "m5" || p.id === "m7") {
    const n = p.id === "m5" ? 5 : 7;
    const info = rudraksha[String(n)];
    return {
      description: L(
        `Original Nepali ${n} Mukhi Rudraksha Mala, associated with ${info?.deity ?? ""} and the planet ${info?.planet ?? ""}. Each mala is X-ray tested and energized in Mahapuja before dispatch.`,
      ),
      benefits: [L(p.intent)],
      howToWear: L(
        `Wear it on a Monday morning after bathing, after chanting “${info?.mantra ?? ""}” 108 times.`,
      ),
      specs: [],
      placement: [],
      certificateMediaId: null,
      youtubeId: null,
    };
  }

  if (p.id.startsWith("r")) {
    const n = p.mukhi ?? parseInt(p.id.slice(1), 10);
    const info = rudraksha[String(n)];
    return {
      description: L(
        `Original Nepali ${n} Mukhi Rudraksha, associated with ${info?.deity ?? ""} and the planet ${info?.planet ?? ""}. Each bead is X-ray tested and energized in Mahapuja before dispatch.`,
      ),
      benefits: [L(p.intent)],
      howToWear: L(
        `Wear it on a Monday morning after bathing, after chanting “${info?.mantra ?? ""}” 108 times.`,
      ),
      specs: [],
      placement: [],
      certificateMediaId: null,
      youtubeId: null,
    };
  }

  return {
    description: L(EMPTY_PRODUCT_CONTENT.description.en),
    benefits: [...EMPTY_PRODUCT_CONTENT.benefits],
    howToWear: L(EMPTY_PRODUCT_CONTENT.howToWear.en),
    specs: [...EMPTY_PRODUCT_CONTENT.specs],
    placement: [...EMPTY_PRODUCT_CONTENT.placement],
    certificateMediaId: null,
    youtubeId: null,
  };
}
