import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFaqRows, type FaqRow } from "@/server/faqs/queries";
import { FaqPageView } from "@/components/sections/faq/FaqPageView";
import type { FaqSet } from "@/lib/domain/enums";

type Props = { params: Promise<{ locale: string }> };

const SET_KEYS: readonly FaqSet[] = [
  "general",
  "shop",
  "consult",
  "kundali99",
  "courses",
  "rituals",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function FaqPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "faqPage" });

  const results = await Promise.all(SET_KEYS.map((k) => getFaqRows(k)));
  const faqsBySet: Record<string, FaqRow[]> = {};
  SET_KEYS.forEach((k, i) => {
    faqsBySet[k] = results[i] ?? [];
  });

  return (
    <main className="min-h-screen bg-iv py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="text-center max-w-2xl mx-auto space-y-3.5">
          <p className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-g7">
            Knowledge Center
          </p>
          <h1 className="font-display text-[clamp(28px,3.8vw,48px)] font-normal text-em9 leading-tight font-soft">
            {t("heading")}
          </h1>
          <p className="font-sans text-[16px] leading-relaxed text-ink6">
            {t("subheading")}
          </p>
        </header>

        <FaqPageView faqsBySet={faqsBySet} />
      </div>
    </main>
  );
}
