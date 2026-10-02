import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { getPage } from "@/server/pages/admin";
import { env } from "@/server/env";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { PageForm } from "@/components/admin/pages/PageForm";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { POLICY_SLUGS, type PolicySlug } from "@/lib/domain/enums";

type Props = {
  params: Promise<{ slug: string }>;
};

const isPolicySlug = (s: string): s is PolicySlug =>
  POLICY_SLUGS.includes(s as PolicySlug);

export default async function EditPolicyPage({
  params,
}: Props): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const { slug } = await params;
  if (!isPolicySlug(slug)) {
    notFound();
  }

  const page = await getPage(slug);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 font-sans text-[13px] text-ink6">
        <Link
          href="/admin/content/pages"
          className="hover:text-em5 inline-flex items-center gap-1 transition-colors"
        >
          <AdminIcon name="arrowL" className="size-3.5" />
          Policies
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{page.titleEn}</span>
      </div>

      <PageHeader
        title={`Edit Policy: ${page.titleEn}`}
        description={`Storefront URL: /policies/${page.slug}`}
      />

      <PageForm
        initialData={page}
        mediaBase={env.NEXT_PUBLIC_MEDIA_URL ?? ""}
      />
    </div>
  );
}
