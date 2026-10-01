import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RashiFinder } from "@/components/sections/rashifal/RashiFinder";
import { RashifalGrid } from "@/components/sections/rashifal/RashifalGrid";
import { RashifalHero, type RashiStone } from "@/components/sections/rashifal/RashifalHero";
import { RashifalProvider } from "@/components/sections/rashifal/period";
import { getProductsByIds } from "@/lib/api/catalog";
import { RASHI } from "@/lib/astro/rashi";
import { productHref } from "@/lib/routes";

/* Rashifal (design/Rashifal.dc.html): the night wheel hero (S8; half-dial + card rail below 768),
   the 12-rashi grid with the five period tabs (#rashis), and the date-of-birth → rashi helper.
   Static; the period lives in `?p=today|tomorrow|week|month|year` (read on mount, rewritten in
   place). Chrome: active "rashifal" (chrome-config). */
type Props = { params: Promise<{ locale: string }> };

const BUILD_NOW = Date.now();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rashifal.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function RashifalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const stoneIds = RASHI.map((r) => r.stone);
  const products = await getProductsByIds(stoneIds);
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Panel gemstone link: the rashi's stone product, "Bracelet…" trimmed (renderVals 263).
  const stones: Record<string, RashiStone> = Object.fromEntries(
    RASHI.map((r) => {
      const p = productMap.get(r.stone);
      return [r.key, p ? { name: p.name.replace(/ Bracelet.*$/i, ""), href: productHref(p) } : null];
    }),
  );

  return (
    <RashifalProvider buildNow={BUILD_NOW}>
      <RashifalHero stones={stones} />
      <RashifalGrid />
      <RashiFinder />
    </RashifalProvider>
  );
}
