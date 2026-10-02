import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Covered } from "@/components/sections/consult/Covered";
import { OtherServices } from "@/components/sections/consult/OtherServices";
import { SamplePages } from "@/components/sections/consult/SamplePages";
import { CTA_ID, ServiceHero } from "@/components/sections/consult/ServiceHero";
import { ServiceFaq } from "@/components/sections/consult/ServiceFaq";
import { StickyBook } from "@/components/sections/consult/StickyBook";
import { Tiers } from "@/components/sections/consult/Tiers";
import { getFaq, getModes, getService, getServices, isReport, recTier } from "@/lib/api/consult";
import { fmt } from "@/lib/core/format";
import { bookHref } from "@/lib/routes";
import { pageMeta } from "@/lib/seo/meta";
import { service as serviceSchema, faqPage } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";

/* Consultation detail (design/Consultation-Detail.dc.html#s=<key>): /consultations/kundali-reading,
   /palmistry, /tarot-reading, /numerology (INV §C). Hero → what's covered → sample pages →
   packages (#tiers) → service FAQ → other services, plus the sticky Book bar. Unknown slugs 404.
   Chrome: tab bar off, FAB lifted to 92px (chrome-config). */
type Props = { params: Promise<{ locale: string; service: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service } = await params;
  const s = await getService(service, locale);
  if (!s) return {};
  const t = await getTranslations({ locale, namespace: "consult.detail" });
  return pageMeta({
    locale,
    path: `/consultations/${s.slug}`,
    title: s.name,
    description: t(`copy.${s.key}.long`),
  });
}

export default async function ServicePage({ params }: Props) {
  const { locale, service } = await params;
  setRequestLocale(locale);
  const s = await getService(service, locale);
  if (!s || s.slug !== service) notFound();
  const [all, modes, faq, t] = await Promise.all([
    getServices(locale),
    getModes(),
    getFaq(s.key, locale),
    getTranslations("consult"),
  ]);
  const dur = isReport(s) ? t("dur.report") : t("dur.range", { a: s.tiers[0].mins, b: s.tiers[2].mins });

  const serviceData = serviceSchema(
    {
      name: s.name,
      description: t(`copy.${s.key}.long`),
      serviceType: "Astrology & Spiritual Consultation",
      tiers: s.tiers.map((tier) => ({
        name: tier.name,
        priceInr: tier.price,
      })),
    },
    `/consultations/${s.slug}`
  );
  const faqData = faqPage(faq.map((item) => ({ q: item.q, a: item.a })));

  return (
    <>
      <JsonLd data={serviceData} />
      <JsonLd data={faqData} />
      <ServiceHero s={s} modes={modes} />
      <Covered s={s} />
      <SamplePages s={s} />
      <Tiers s={s} />
      <ServiceFaq s={s} items={faq} />
      <OtherServices others={all.filter((o) => o.key !== s.key)} />
      <StickyBook
        targetId={CTA_ID}
        icon={s.icon}
        name={s.name}
        sub={t("detail.fromLine", { price: fmt(s.tiers[0].price), dur })}
        href={bookHref(s.key, recTier(s).k)}
        label={t("detail.bookNow")}
      />
    </>
  );
}
