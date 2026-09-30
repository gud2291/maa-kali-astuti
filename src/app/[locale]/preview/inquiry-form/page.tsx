import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { getCourseOptions } from "@/lib/api/content";

/* QA-only preview of InquiryForm (F9) until its real pages exist (F13: /sadhana-courses#enquire,
   course detail, /rituals#inquire). Not available in production builds; remove in F15.
   /preview/inquiry-form?kind=course|ritual&preset=baglamukhi|hanuman|kali|durga|shiva|bhairav */
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kind?: string; preset?: string }>;
};

export const metadata: Metadata = { title: "Inquiry form preview", robots: { index: false, follow: false } };

export default async function InquiryFormPreview({ params, searchParams }: Props) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  setRequestLocale(locale);
  const q = await searchParams;
  const courses = await getCourseOptions();
  const kind = q.kind === "ritual" ? "ritual" : "course";
  const preset = courses.some((c) => c.key === q.preset) ? q.preset! : "baglamukhi";

  return (
    <section className="bg-s1 shadow-hair-y">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-2">
        <InquiryForm key={kind} kind={kind} preset={preset} courses={courses} />
      </div>
    </section>
  );
}
