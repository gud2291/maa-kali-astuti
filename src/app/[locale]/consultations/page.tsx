import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ConsultFaq } from "@/components/sections/consult/ConsultFaq";
import { ConsultHero } from "@/components/sections/consult/ConsultHero";
import { ConsultTestimonials } from "@/components/sections/consult/ConsultTestimonials";
import { Credentials } from "@/components/sections/consult/Credentials";
import { HowItWorks } from "@/components/sections/consult/HowItWorks";
import { ServiceRows } from "@/components/sections/consult/ServiceRows";
import { getConsultSteps, getFaq, getModes, getServices, getTestimonials } from "@/lib/api/consult";
import { pageMeta } from "@/lib/seo/meta";
import { faqPage } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";

/* Consultations landing (design/Consultations.dc.html): hero → four services → how it works →
   credentials → testimonials → FAQ. Static. Chrome: active "consult", tab bar on. */
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "consult.meta" });
  return pageMeta({
    locale,
    path: "/consultations",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ConsultationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [services, modes, steps, testimonials, faq] = await Promise.all([
    getServices(locale),
    getModes(),
    getConsultSteps(),
    getTestimonials(locale),
    getFaq("consult", locale),
  ]);

  const faqData = faqPage(faq.map(([q, a]) => ({ q, a })));

  return (
    <>
      <JsonLd data={faqData} />
      <ConsultHero />
      <ServiceRows services={services} modes={modes} />
      <HowItWorks icons={steps.map(([icon]) => icon)} />
      <Credentials />
      <ConsultTestimonials items={testimonials} />
      <ConsultFaq items={faq} />
    </>
  );
}
