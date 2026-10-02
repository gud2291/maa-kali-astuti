import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPage } from "@/server/pages/queries";
import { PolicyView } from "@/components/sections/policies/PolicyView";
import { POLICIES, type PolicySlug } from "@/lib/routes";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

const isPolicy = (s: string): s is PolicySlug => s in POLICIES;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPolicy(slug)) return {};

  const page = await getPage(slug);
  const isHi = locale === "hi";
  const title = (isHi && page?.titleHi) || page?.titleEn || POLICIES[slug];

  return {
    title,
    description: `${title} - Maa Kali Astuti`,
  };
}

export default async function PolicyPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { locale, slug } = await params;
  if (!isPolicy(slug)) notFound();

  setRequestLocale(locale);

  const page = await getPage(slug);

  return <PolicyView page={page} slug={slug} />;
}
