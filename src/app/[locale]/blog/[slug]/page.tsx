import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getArticleBySlug, getArticleList } from "@/server/articles/queries";
import { getCatalog } from "@/server/catalog/queries";
import { ArticleView } from "@/components/sections/blog/ArticleView";
import { pageMeta } from "@/lib/seo/meta";
import { article as articleSchema, breadcrumbs, faqPage } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
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
    article.seoDescEn ||
    (isHi && article.excerptHi) ||
    article.excerptEn ||
    "";

  const image = article.coverMedia?.variants?.[0]?.key || article.legacyArt || null;

  return pageMeta({
    locale,
    path: `/blog/${article.slug}`,
    title,
    description,
    image,
    type: "article",
  });
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

  const isHi = locale === "hi";
  const articleTitle = isHi ? article.titleHi || article.titleEn : article.titleEn;
  const articleDesc = isHi ? article.excerptHi || article.excerptEn : article.excerptEn;
  const coverUrl = article.coverMedia?.variants?.[0]?.key || article.legacyArt || undefined;

  const breadcrumbData = breadcrumbs([
    { name: isHi ? "होम" : "Home", url: "/" },
    { name: isHi ? "ब्लॉग" : "Blog", url: "/blog" },
    { name: articleTitle, url: `/blog/${article.slug}` },
  ]);

  const articleData = articleSchema(
    {
      title: articleTitle,
      description: articleDesc,
      image: coverUrl,
      publishedAt: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : new Date().toISOString(),
      authorName: "Sadhak Pawan Pandey",
    },
    `/blog/${article.slug}`
  );

  const hasFaq = Array.isArray(article.faq) && article.faq.length > 0;
  const faqData = hasFaq
    ? faqPage(
        article.faq.map((f) => ({
          q: isHi ? f.q.hi || f.q.en : f.q.en,
          a: isHi ? f.a.hi || f.a.en : f.a.en,
        }))
      )
    : null;

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={articleData} />
      {faqData && <JsonLd data={faqData} />}
      <ArticleView
        article={article}
        relatedArticles={related}
        products={mentionedProducts}
      />
    </>
  );
}
