import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/layout/ComingSoon";

/* Deferred page (INV §G): full search results. The overlay search in the header works today. */
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "soon.pages" });
  return { title: t("search"), robots: { index: false } };
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 80);
  const t = await getTranslations("soon");
  return <ComingSoon title={t("pages.search")} lead={q ? t("query", { q }) : undefined} />;
}
