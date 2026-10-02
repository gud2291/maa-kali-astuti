import { requireAdminPage } from "@/server/auth/guards";
import { adminSearch } from "@/server/search/admin";
import { SearchResults } from "@/components/admin/search/SearchResults";

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("dashboard.view");

  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";

  const results = await adminSearch(q);

  return (
    <div className="space-y-6">
      <SearchResults results={results} />
    </div>
  );
}
