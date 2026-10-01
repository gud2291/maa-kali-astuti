import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { can } from "@/lib/domain/permissions";
import { getCategoryAdmin } from "@/server/catalog/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { CATEGORY_KEYS, type CategoryKey } from "@/lib/domain/enums";

export default async function CategoryDetailPage(props: {
  params: Promise<{ key: string }>;
}): Promise<React.JSX.Element> {
  const admin = await requireAdminPage("products.view");
  const canEdit = can(admin.role, "products.edit");

  const { key } = await props.params;

  if (!CATEGORY_KEYS.includes(key as CategoryKey)) {
    notFound();
  }

  const category = await getCategoryAdmin(key as CategoryKey);
  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={category.nameEn}
        description={`Manage settings, descriptions, and SEO for the /${category.slug} category.`}
        backHref="/admin/categories"
        backLabel="Categories"
      />

      <CategoryForm category={category} canEdit={canEdit} />
    </div>
  );
}
