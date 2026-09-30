import { setRequestLocale } from "next-intl/server";
import { Bestsellers } from "@/components/sections/home/Bestsellers";
import { CategoryArches } from "@/components/sections/home/CategoryArches";
import { Hero } from "@/components/sections/home/Hero";
import { NagSpotlight } from "@/components/sections/home/NagSpotlight";
import { TrustMarquee } from "@/components/sections/home/TrustMarquee";
import { getProduct } from "@/lib/api/catalog";

/* Home (design/Home.dc.html). F5 builds §1–5 (hero → 12 Nag spotlight); F6 adds §6–9
   (rashifal → intentions) and F7 §10–17 (courses → newsletter). */

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
    </>
  );
}
