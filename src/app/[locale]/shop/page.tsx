import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShopView } from "@/components/sections/shop/ShopView";
import { getAllProducts, getCategories, getIntents } from "@/lib/api/catalog";

/* All offerings (design/Shop.dc.html, `#c=all`). Static; filters live in the query string and
   are read on the client (ARCHITECTURE: all pages SSG). */
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return { title: t("meta.all"), description: t("allDesc") };
}

export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [products, categories, intents] = await Promise.all([getAllProducts(), getCategories(), getIntents()]);
  return <ShopView products={products} categories={categories} intents={intents} initialCat="all" />;
}
