import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ShopView } from "@/components/sections/shop/ShopView";
import { getAllProducts, getCategories, getCategory, getIntents } from "@/lib/api/catalog";
import { pageMeta } from "@/lib/seo/meta";
import { breadcrumbs } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";

/* Category template (design/Shop.dc.html#c=<key>): /shop/rudraksha-malas, /shop/crystal-bracelets,
   /shop/bhojpatra-amulets, /shop/havan-samagri, /shop/energized-copper (INV §C). Same view as
   /shop, opened on this category. Unknown slugs 404. */
type Props = { params: Promise<{ locale: string; category: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const c = await getCategory(category);
  if (!c) return {};
  const isHi = locale === "hi";
  const title = isHi ? c.hi : c.name;
  const description = isHi ? c.deshi : c.desc;
  return pageMeta({
    locale,
    path: `/shop/${c.slug}`,
    title,
    description,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const c = await getCategory(category);
  if (!c || c.slug !== category) notFound();
  const [products, categories, intents] = await Promise.all([getAllProducts(), getCategories(), getIntents()]);

  const isHi = locale === "hi";
  const breadcrumbData = breadcrumbs([
    { name: isHi ? "होम" : "Home", url: "/" },
    { name: isHi ? "दुकान" : "Shop", url: "/shop" },
    { name: isHi ? c.hi : c.name, url: `/shop/${c.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <ShopView products={products} categories={categories} intents={intents} initialCat={c.key} />
    </>
  );
}
