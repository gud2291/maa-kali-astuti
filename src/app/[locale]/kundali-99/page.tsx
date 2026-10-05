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
import { getSetting } from "@/server/settings/queries";
import { pageMeta } from "@/lib/seo/meta";
import { service as serviceSchema, faqPage } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";

/* Janam Kundali ₹99 (design/Kundali-99.dc.html): night tool hero (form → generating → ready),
   the free preview with the ₹99 payment, then what's inside, sample pages, reviews and FAQ.
   Static; every state is client-side in KundaliTool. QA-only: ?demo=generating|preview|success,
   ?pay=fail (INV §C). Chrome: active "kundali" (chrome-config). */
type Props = { params: Promise<{ locale: string }> };

const BUILD_NOW = Date.now();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "k99.meta" });
  return pageMeta({
    locale,
    path: "/kundali-99",
    title: t("title"),
    description: t("description"),
  });
}

export default async function Kundali99Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [faq, reviews, kundaliSetting] = await Promise.all([
    getFaq("kundali99", locale),
    getKundaliReviews(),
    getSetting("kundali"),
  ]);

  const isHi = locale === "hi";
  const serviceData = serviceSchema(
    {
      name: isHi ? `वैदिक जन्मपत्री ₹${kundaliSetting.priceInr}` : `Vedic Janam Kundali Report ₹${kundaliSetting.priceInr}`,
      description: isHi
        ? "साधक पवन पाण्डेय द्वारा विस्तृत वैदिक जन्मपत्री विश्लेषण।"
        : "Complete computerized Vedic birth chart and comprehensive planetary life analysis.",
      serviceType: "Vedic Astrology Report",
      tiers: [
        {
          name: isHi ? "सम्पूर्ण जन्मपत्री" : "Complete Kundali Report",
          priceInr: kundaliSetting.priceInr,
        },
      ],
    },
    "/kundali-99"
  );
  const faqData = faqPage(faq.map(([q, a]) => ({ q, a })));

  return (
    <>
      <JsonLd data={serviceData} />
      <JsonLd data={faqData} />
      <KundaliTool
        buildNow={BUILD_NOW}
        priceInr={kundaliSetting.priceInr}
        mrpInr={kundaliSetting.mrpInr}
        enabled={kundaliSetting.enabled}
        intro={<K99Intro priceInr={kundaliSetting.priceInr} mrpInr={kundaliSetting.mrpInr} />}
        facts={<K99Facts />}
      />
      <K99Contents />
      <K99Samples />
      <K99Reviews reviews={reviews} />
      <K99Faq items={faq} />
    </>
  );
}
