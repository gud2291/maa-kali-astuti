import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getArticleBySlug, getArticleList } from "@/server/articles/queries";
import { getCatalog } from "@/server/catalog/queries";
import { ArticleView } from "@/components/sections/blog/ArticleView";
import type { Product } from "@/types/product";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getArticleList();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const isHi = locale === "hi";
  const title =
    (isHi && article.seoTitleHi) ||
    article.seoTitleEn ||
    (isHi && article.titleHi) ||
    article.titleEn;

  const description =
    (isHi && article.seoDescHi) ||
    article.seoDescHi ||
    (isHi && article.excerptHi) ||
    article.excerptEn;

  return {
    title,
    description,
  };
}

export default async function ArticleDetailPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const [allArticles, catalog] = await Promise.all([
    getArticleList(),
    getCatalog(),
  ]);

  const related = allArticles
    .filter((a) => a.category === article.category && a.slug !== slug)
    .slice(0, 3);

  const mentionedProducts = article.productIds
    .map((pid) => catalog.products.find((p) => p.id === pid))
    .filter((p): p is Product => Boolean(p));

  return (
    <ArticleView
      article={article}
      relatedArticles={related}
      products={mentionedProducts}
    />
  );
}
