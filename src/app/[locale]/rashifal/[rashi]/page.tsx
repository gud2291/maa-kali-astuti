import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RashiAreas, RashiHero, RashiLucky } from "@/components/sections/rashifal/RashiDetail";
import { RashiCta, RashiRecommend, RashiRemedy } from "@/components/sections/rashifal/RashiSections";
import { RashifalProvider } from "@/components/sections/rashifal/period";
import { getProductsByIds } from "@/lib/api/catalog";
import { RASHI } from "@/lib/astro/rashi";

/* Rashi detail (design/Rashi-Detail.dc.html#r=<key>&p=<period>): /rashifal/mesha … /meena
   (INV §C). Hero with the period tabs → area meters → lucky trio + gemstone → remedy →
   compatible rashis + recommended products → Kundali CTA. The period is `?p=` (read on mount,
   rewritten in place). Unknown slugs 404. Chrome: active "rashifal". */
type Props = { params: Promise<{ locale: string; rashi: string }> };

const BUILD_NOW = Date.now();

export const dynamicParams = false;

export function generateStaticParams() {
  return RASHI.map((r) => ({ rashi: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, rashi } = await params;
  const r = RASHI.find((x) => x.slug === rashi);
  if (!r) return {};
  const t = await getTranslations({ locale, namespace: "rashifal.meta" });
  return {
    title: t("rashiTitle", { name: r.en, west: r.west }),
    description: t("rashiDescription", { name: r.en, west: r.west }),
  };
}

export default async function RashiPage({ params }: Props) {
  const { locale, rashi } = await params;
  setRequestLocale(locale);
  const r = RASHI.find((x) => x.slug === rashi);
  if (!r) notFound();
  // renderVals 197: the stone, the rudrakshas, the amulet — unique, existing, max 4.
  const candidateIds = [r.stone, ...(r.rud ?? []), r.amulet].filter(
    (id, i, a): id is string => !!id && a.indexOf(id) === i,
  );
  const fetchedProducts = await getProductsByIds(candidateIds);
  const productMap = new Map(fetchedProducts.map((p) => [p.id, p]));
  const products = candidateIds
    .map((id) => productMap.get(id))
    .filter((p): p is (typeof fetchedProducts)[number] => !!p)
    .slice(0, 4);
  const gem = productMap.get(r.stone) ?? null;

  return (
    <RashifalProvider key={r.key} buildNow={BUILD_NOW}>
      <RashiHero r={r} />
      <RashiAreas r={r} />
      <RashiLucky r={r} gem={gem} />
      <RashiRemedy r={r} />
      <RashiRecommend r={r} products={products} />
      <RashiCta r={r} />
    </RashifalProvider>
  );
}
