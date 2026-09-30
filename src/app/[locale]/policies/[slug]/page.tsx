import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { POLICIES, type PolicySlug } from "@/lib/routes";

/* Deferred page (INV §G): footer policy links. Content comes from the client ([client-confirm]). */
type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

const isPolicy = (s: string): s is PolicySlug => s in POLICIES;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPolicy(slug)) return {};
  const t = await getTranslations({ locale, namespace: "soon.pages" });
  return { title: t(slug), robots: { index: false } };
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  if (!isPolicy(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("soon.pages");
  return <ComingSoon title={t(slug)} />;
}
