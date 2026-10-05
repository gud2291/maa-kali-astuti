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
import { InlineArt } from "@/components/ui/InlineArt";
import { getCourse, getCourseKit, getCourseOptions, getCourses } from "@/lib/api/content";
import { getFaq } from "@/lib/api/consult";
import { getSetting } from "@/server/settings/queries";
import { YANTRA_GOLD } from "@/lib/art/yantras";
import { fmt } from "@/lib/core/format";
import { pageMeta } from "@/lib/seo/meta";
import { course as courseSchema, faqPage } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";

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
  return pageMeta({
    locale,
    path: `/sadhana-courses/${c.slug}`,
    title: t("detailTitle", { name: c.en }),
    description: t("detailDescription", { essence: c.essence, days: c.days }),
  });
}

export default async function CoursePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const c = await getCourse(slug, locale);
  if (!c || c.slug !== slug) notFound();
  const [all, kit, options, t, coursesSetting, faq] = await Promise.all([
    getCourses(locale),
    getCourseKit(),
    getCourseOptions(locale),
    getTranslations("sadhana.detail.sticky"),
    getSetting("courses"),
    getFaq("courses", locale),
  ]);

  const courseFee = c.feeInr ?? coursesSetting.feeInr;

  const courseData = courseSchema(
    {
      name: locale === "hi" ? c.hi : c.en,
      description: c.essence,
      providerName: "Sadhak Pawan Pandey",
    },
    `/sadhana-courses/${c.slug}`,
    courseFee
  );
  const faqData = faqPage(faq.map(([q, a]) => ({ q, a })));

  return (
    <>
      <JsonLd data={courseData} />
      <JsonLd data={faqData} />
      <CourseHero c={c} />
      <CourseOverview c={c} />
      <CourseAttain c={c} />
      <CourseStructure c={c} modules={kit.modules} />
      <CourseNiyam c={c} niyam={kit.niyam} />
      <CourseSupport />
      <CourseFee fee={courseFee} instalments={coursesSetting.instalments} locale={locale} />
      <CourseEnquire c={c} others={all.filter((o) => o.key !== c.key)} courses={options} />
      <StickyBook
        targetId={COURSE_CTA_ID}
        name={c.en}
        sub={t("sub", { price: fmt(courseFee), days: c.days })}
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
