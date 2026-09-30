import { setRequestLocale } from "next-intl/server";
import { AstroTools } from "@/components/sections/home/AstroTools";
import { Bestsellers } from "@/components/sections/home/Bestsellers";
import { CategoryArches } from "@/components/sections/home/CategoryArches";
import { ConsultBento } from "@/components/sections/home/ConsultBento";
import { Hero } from "@/components/sections/home/Hero";
import { Intentions } from "@/components/sections/home/Intentions";
import { NagSpotlight } from "@/components/sections/home/NagSpotlight";
import { RashifalSection } from "@/components/sections/home/RashifalSection";
import { TrustMarquee } from "@/components/sections/home/TrustMarquee";
import { getProduct } from "@/lib/api/catalog";

/* Home (design/Home.dc.html). F5 built §1–5 (hero → 12 Nag spotlight), F6 §6–9 (rashifal wheel →
   floating stones); F7 appends §10–17 (courses → newsletter) after <Intentions />. */

/** Static page: date-dependent text renders with the build date, then updates on the client. */
const BUILD_NOW = Date.now();

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nag12 = await getProduct("nag12");

  return (
    <>
      <Hero />
      <TrustMarquee />
      <CategoryArches />
      <Bestsellers />
      {nag12 && <NagSpotlight product={nag12} buildNow={BUILD_NOW} />}
      <RashifalSection buildNow={BUILD_NOW} />
      <AstroTools buildNow={BUILD_NOW} />
      <ConsultBento />
      <Intentions />
    </>
  );
}
