import type { Metadata } from "next";
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
import { getFaq, getServiceCards, getTestimonials } from "@/lib/api/consult";
import {
  getCourses,
  getHomeReviews,
  getJournal,
  getRituals,
  getVideos,
} from "@/lib/api/content";
import { getSetting } from "@/server/settings/queries";
import { pageMeta } from "@/lib/seo/meta";

/* Home (design/Home.dc.html). F5 built §1–5 (hero → 12 Nag spotlight), F6 §6–9 (rashifal wheel →
   floating stones), F7 §10–17 (courses → newsletter). The footer's newsletter is off on Home. */

/** Static page: date-dependent text renders with the build date, then updates on the client. */
const BUILD_NOW = Date.now();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = await getSetting("seo");
  const isHi = locale === "hi";
  const title =
    (isHi ? seo.metaTitleHi : seo.metaTitleEn) ||
    (isHi
      ? "माँ काली स्तुति — साधक पवन पाण्डेय"
      : "Maa Kali Astuti — Sadhak Pawan Pandey");
  const description =
    (isHi ? seo.metaDescHi : seo.metaDescEn) ||
    (isHi
      ? "प्रामाणिक रुद्राक्ष, रत्न, सिद्ध यंत्र एवं साधक पवन पाण्डेय जी से वैदिक परामर्श।"
      : "Authentic rudraksha, energized gemstones, yantras and Vedic consultations with Sadhak Pawan Pandey.");
  return pageMeta({
    locale,
    path: "/",
    title,
    description,
    image: seo.ogImage,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [
    home,
    nag12,
    serviceCards,
    courses,
    faqItems,
    journal,
    rituals,
    testimonials,
    reviews,
    videos,
  ] = await Promise.all([
    getSetting("home"),
    getProduct("nag12"),
    getServiceCards(locale),
    getCourses(locale),
    getFaq("home", locale),
    getJournal(locale),
    getRituals(locale),
    getTestimonials(locale),
    getHomeReviews(locale),
    getVideos(locale),
  ]);

  const { sections } = home;

  return (
    <>
      {sections.hero && <Hero locale={locale} />}
      {sections.trust && <TrustMarquee />}
      {sections.categories && <CategoryArches />}
      {sections.bestsellers && <Bestsellers />}
      {sections.nagSpotlight && nag12 && <NagSpotlight product={nag12} buildNow={BUILD_NOW} />}
      {sections.rashifal && <RashifalSection buildNow={BUILD_NOW} />}
      {sections.astroTools && <AstroTools buildNow={BUILD_NOW} />}
      {sections.consult && <ConsultBento services={serviceCards} />}
      {sections.intentions && <Intentions />}
      {sections.courses && <CourseTrack courses={courses} />}
      {sections.rituals && <RitualsTeaser rituals={rituals} />}
      {sections.about && <AboutTeaser />}
      {sections.videos && <VideoSection videos={videos} />}
      {sections.testimonials && <Testimonials testimonials={testimonials} reviews={reviews} />}
      {sections.journal && <Journal articles={journal} />}
      {sections.faq && <FaqSection items={faqItems} />}
      {sections.newsletter && <NewsletterBand />}
    </>
  );
}
