import { setRequestLocale } from "next-intl/server";
import { AboutTeaser } from "@/components/sections/home/AboutTeaser";
import { AstroTools } from "@/components/sections/home/AstroTools";
import { Bestsellers } from "@/components/sections/home/Bestsellers";
import { CategoryArches } from "@/components/sections/home/CategoryArches";
import { ConsultBento } from "@/components/sections/home/ConsultBento";
import { CourseTrack } from "@/components/sections/home/CourseTrack";
import { FaqSection } from "@/components/sections/home/FaqSection";
import { Hero } from "@/components/sections/home/Hero";
import { Intentions } from "@/components/sections/home/Intentions";
import { Journal } from "@/components/sections/home/Journal";
import { NagSpotlight } from "@/components/sections/home/NagSpotlight";
import { NewsletterBand } from "@/components/sections/home/NewsletterBand";
import { RashifalSection } from "@/components/sections/home/RashifalSection";
import { RitualsTeaser } from "@/components/sections/home/RitualsTeaser";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { TrustMarquee } from "@/components/sections/home/TrustMarquee";
import { VideoSection } from "@/components/sections/home/VideoSection";
import { getProduct } from "@/lib/api/catalog";

/* Home (design/Home.dc.html). F5 built §1–5 (hero → 12 Nag spotlight), F6 §6–9 (rashifal wheel →
   floating stones), F7 §10–17 (courses → newsletter). The footer's newsletter is off on Home. */

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
      <CourseTrack />
      <RitualsTeaser />
      <AboutTeaser />
      <VideoSection />
      <Testimonials />
      <Journal />
      <FaqSection />
      <NewsletterBand />
    </>
  );
}
