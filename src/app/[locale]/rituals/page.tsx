import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  RitualInquire,
  RitualProcess,
  RitualReceive,
  RitualsEthics,
  RitualsHero,
  RitualTypes,
} from "@/components/sections/rituals/RitualsSections";
import { getRituals } from "@/lib/api/content";
import { getFaq } from "@/lib/api/consult";

/* Rituals & Anushthan (design/Rituals.dc.html): night hero with the diya thali → ethics → ritual
   types → scroll-filled five-step process (#process) → what you receive → inquiry (#inquire: FAQ
   "rituals" + InquiryForm kind ritual). Static. Chrome: active "rituals" (chrome-config). */
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rituals.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function RitualsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [data, faq] = await Promise.all([getRituals(), getFaq("rituals")]);

  return (
    <>
      <RitualsHero />
      <RitualsEthics />
      <RitualTypes rituals={data.rituals} />
      <RitualProcess steps={data.process} />
      <RitualReceive items={data.receive} />
      <RitualInquire faq={faq} />
    </>
  );
}
