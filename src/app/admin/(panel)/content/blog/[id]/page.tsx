import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { getArticle } from "@/server/articles/admin";
import { db } from "@/server/db/client";
import { products } from "@/server/db/schema/catalog";
import { ne, asc } from "drizzle-orm";
import { env } from "@/server/env";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ArticleForm } from "@/components/admin/blog/ArticleForm";
import { AdminIcon } from "@/components/admin/AdminIcon";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({
  params,
}: Props): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    notFound();
  }

  let article;
  try {
    article = await getArticle(numId);
  } catch {
    notFound();
  }

  const productList = await db
    .select({ id: products.id, name: products.nameEn })
    .from(products)
    .where(ne(products.status, "archived"))
    .orderBy(asc(products.nameEn));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 font-sans text-[13px] text-ink6">
        <Link
          href="/admin/content/blog"
          className="hover:text-em5 inline-flex items-center gap-1 transition-colors"
        >
          <AdminIcon name="arrowL" className="size-3.5" />
          Articles
        </Link>
        <span>/</span>
        <span className="text-ink font-medium truncate max-w-xs">{article.titleEn}</span>
      </div>

      <PageHeader
        title={`Edit Article: ${article.titleEn}`}
        description={`Slug: /blog/${article.slug} · Status: ${article.status}`}
      />

      <ArticleForm
        initialData={article}
        productOptions={productList}
        mediaBase={env.NEXT_PUBLIC_MEDIA_URL ?? ""}
      />
    </div>
  );
}
