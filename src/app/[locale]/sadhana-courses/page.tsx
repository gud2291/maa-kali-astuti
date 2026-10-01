import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  CourseCards,
  CoursesEnquire,
  CoursesFaq,
  CoursesHero,
  Enrollment,
  SeriousSeekers,
} from "@/components/sections/courses/CoursesSections";
import { getCourseKit, getCourseOptions, getCourses } from "@/lib/api/content";
import { getFaq } from "@/lib/api/consult";

/* Sadhana Courses (design/Sadhana-Courses.dc.html): night hero with the "includes" card → the six
   course cards (#six, S11 yantra draw) → five-step enrollment (line grows on view) → serious seekers
   → FAQ ("courses") → enquire (#enquire, InquiryForm kind course, preset kali). Static.
   Chrome: active "courses" (chrome-config). */
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sadhana.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function SadhanaCoursesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [courses, kit, faq, options] = await Promise.all([
    getCourses(locale),
    getCourseKit(),
    getFaq("courses", locale),
    getCourseOptions(locale),
  ]);

  return (
    <>
      <CoursesHero includes={kit.includes} />
      <CourseCards courses={courses} />
      <Enrollment steps={kit.enroll} />
      <SeriousSeekers />
      <CoursesFaq items={faq} />
      <CoursesEnquire courses={options} />
    </>
  );
}
