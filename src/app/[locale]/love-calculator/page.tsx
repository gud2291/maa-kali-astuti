import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoveHow } from "@/components/sections/love/LoveHow";
import { LoveNamesProvider } from "@/components/sections/love/LoveNames";
import { LoveHero, LoveMilan, LoveProducts } from "@/components/sections/love/LoveSections";
import { getAllProducts } from "@/lib/api/catalog";
import { getService } from "@/lib/api/consult";
import { pageMeta } from "@/lib/seo/meta";

/* Love Calculator (design/Love-Calculator.dc.html): the name tool (S13), how it works (follows the
   typed names), the note of honesty + Ashtakoot Milan CTA, and 4 products for love & harmony.
   Static. Chrome: nothing active (chrome-config default). */
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "love.meta" });
  return pageMeta({
    locale,
    path: "/love-calculator",
    title: t("title"),
    description: t("description"),
  });
}

export default async function LoveCalculatorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [all, kundaliSvc] = await Promise.all([getAllProducts(), getService("kundali", locale)]);
  // Design renderVals 238: the rose-quartz bracelet first, then love / relationship / marriage products.
  const byId = new Map(all.map((p) => [p.id, p]));
  const ids = ["b-rose"].concat(
    all.filter((p) => p.id !== "b-rose" && (p.ik === "love" || /love|relation|marri/i.test(p.intent || ""))).map((p) => p.id),
  );
  const products = ids.flatMap((id) => byId.get(id) ?? []).slice(0, 4);
  const premium = kundaliSvc?.tiers.find((x) => x.k === "premium") ?? kundaliSvc?.tiers[2];

  return (
    <>
      <LoveNamesProvider>
        <LoveHero />
        <LoveHow />
      </LoveNamesProvider>
      <LoveMilan premiumPrice={premium?.price ?? 0} />
      <LoveProducts products={products} />
    </>
  );
}
