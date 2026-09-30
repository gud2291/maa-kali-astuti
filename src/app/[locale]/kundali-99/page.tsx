import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  K99Contents,
  K99Facts,
  K99Faq,
  K99Intro,
  K99Reviews,
  K99Samples,
} from "@/components/sections/kundali/K99Sections";
import { KundaliTool } from "@/components/sections/kundali/KundaliTool";
import { getFaq } from "@/lib/api/consult";
import { getKundaliReviews } from "@/lib/api/content";

/* Janam Kundali ₹99 (design/Kundali-99.dc.html): night tool hero (form → generating → ready),
   the free preview with the mock ₹99 payment, then what's inside, sample pages, reviews and FAQ.
   Static; every state is client-side in KundaliTool. QA-only: ?demo=generating|preview|success,
   ?pay=fail (INV §C). Chrome: active "kundali" (chrome-config). */
type Props = { params: Promise<{ locale: string }> };

const BUILD_NOW = Date.now();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "k99.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function Kundali99Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [faq, reviews] = await Promise.all([getFaq("kundali99"), getKundaliReviews()]);

  return (
    <>
      <KundaliTool buildNow={BUILD_NOW} intro={<K99Intro />} facts={<K99Facts />} />
      <K99Contents />
      <K99Samples />
      <K99Reviews reviews={reviews} />
      <K99Faq items={faq} />
    </>
  );
}
