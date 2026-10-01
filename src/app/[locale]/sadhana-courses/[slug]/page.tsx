import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StickyBook } from "@/components/sections/consult/StickyBook";
import {
  COURSE_CTA_ID,
  CourseAttain,
  CourseEnquire,
  CourseFee,
  CourseHero,
  CourseNiyam,
  CourseOverview,
  CourseStructure,
  CourseSupport,
} from "@/components/sections/courses/CourseDetail";
import { COURSE_FEE } from "@/components/sections/courses/CoursesSections";
import { InlineArt } from "@/components/ui/InlineArt";
import { getCourse, getCourseKit, getCourseOptions, getCourses } from "@/lib/api/content";
import { YANTRA_GOLD } from "@/lib/art/yantras";
import { fmt } from "@/lib/core/format";

/* Course detail (design/Course-Detail.dc.html#c=<key>): /sadhana-courses/<deity>-sadhana for the six
   courses (INV §C); unknown slugs 404. Hero (arch yantra, S11) → overview → what you attain →
   structure (sticky side) → niyam → support → fee → enquire (#enquire, InquiryForm preset = this
   course) + the other five, plus the sticky Enquire bar once the hero CTA row has scrolled away.
   Chrome: tab bar off, FAB lifted to 92px (chrome-config). */
type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getCourses()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = await getCourse(slug, locale);
  if (!c) return {};
  const t = await getTranslations({ locale, namespace: "sadhana.meta" });
  return {
    title: t("detailTitle", { name: c.en }),
    description: t("detailDescription", { essence: c.essence, days: c.days }),
  };
}

export default async function CoursePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const c = await getCourse(slug, locale);
  if (!c || c.slug !== slug) notFound();
  const [all, kit, options, t] = await Promise.all([
    getCourses(locale),
    getCourseKit(),
    getCourseOptions(locale),
    getTranslations("sadhana.detail.sticky"),
  ]);

  return (
    <>
      <CourseHero c={c} />
      <CourseOverview c={c} />
      <CourseAttain c={c} />
      <CourseStructure c={c} modules={kit.modules} />
      <CourseNiyam c={c} niyam={kit.niyam} />
      <CourseSupport />
      <CourseFee />
      <CourseEnquire c={c} others={all.filter((o) => o.key !== c.key)} courses={options} />
      <StickyBook
        targetId={COURSE_CTA_ID}
        name={c.en}
        sub={t("sub", { price: fmt(COURSE_FEE), days: c.days })}
        anchor="enquire"
        label={t("cta")}
        ctaIcon="chat"
        lead={
          <span className="grid size-10 flex-none place-items-center rounded-pill bg-n9 p-1.5 max-md:hidden">
            <InlineArt svg={YANTRA_GOLD[c.key as keyof typeof YANTRA_GOLD]} uid={`st${c.key}`} />
          </span>
        }
      />
    </>
  );
}
