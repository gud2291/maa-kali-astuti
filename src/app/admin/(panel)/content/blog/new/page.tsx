import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { products } from "@/server/db/schema/catalog";
import { ne, asc } from "drizzle-orm";
import { env } from "@/server/env";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ArticleForm } from "@/components/admin/blog/ArticleForm";
import { AdminIcon } from "@/components/admin/AdminIcon";

export default async function NewArticlePage(): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

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
        <span className="text-ink font-medium">New Article</span>
      </div>

      <PageHeader
        title="Write New Article"
        description="Draft a spiritual guide, remedy, or blog post in English and Hindi."
      />

      <ArticleForm
        productOptions={productList}
        mediaBase={env.NEXT_PUBLIC_MEDIA_URL ?? ""}
      />
    </div>
  );
}
