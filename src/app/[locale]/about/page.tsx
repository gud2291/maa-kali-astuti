import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  AboutBooks,
  AboutCta,
  AboutHero,
  AboutMedia,
  AboutPillars,
  AboutStory,
} from "@/components/sections/about/AboutSections";
import { getAbout, getVideos } from "@/lib/api/content";
import { pageMeta } from "@/lib/seo/meta";
import { person } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";

/* About Sadhak Ji (design/About.dc.html): hero portrait → sticky six-chapter story (night) →
   pillars → published books (sand) → three discourses (→ /videos?v=) → emerald contact band.
   Static. Chrome: active "about" (chrome-config). */
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.meta" });
  return pageMeta({
    locale,
    path: "/about",
    title: t("title"),
    description: t("description"),
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [about, vids] = await Promise.all([getAbout(), getVideos(locale)]);
  // Design picks VIDEOS[0], [2], [4] (About 251).
  const media = [vids.videos[0], vids.videos[2], vids.videos[4]];
  const cats = Object.fromEntries(vids.cats.map(([k, en]) => [k, en]));

  const personData = person();

  return (
    <>
      <JsonLd data={personData} />
      <AboutHero />
      <AboutStory chapters={about.timeline} />
      <AboutPillars pillars={about.pillars} />
      <AboutBooks books={about.books} />
      <AboutMedia videos={media} cats={cats} />
      <AboutCta />
    </>
  );
}
