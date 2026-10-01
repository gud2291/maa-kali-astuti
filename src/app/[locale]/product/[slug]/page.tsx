import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { getAllProducts, getProduct } from "@/lib/api/catalog";
import { fmt } from "@/lib/core/format";

/* Deferred page (INV §G): the two PDP templates (Rudraksha, Copper 12 Nag) are not designed
   yet. Every card, mega-menu and search link already points here; unknown slugs 404. */
type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return (await getAllProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return { title: locale === "hi" ? p.hi : p.name, robots: { index: false } };
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await getProduct(slug);
  if (!p) notFound();
  const t = await getTranslations("soon");
  return (
    <ComingSoon title={locale === "hi" ? p.hi : p.name} lead={`${fmt(p.price)} · ${p.catName}`}>
      <p className="m-0 max-w-[520px] font-sans text-[15px] leading-[1.6] text-ink6">{t("product")}</p>
    </ComingSoon>
  );
}
