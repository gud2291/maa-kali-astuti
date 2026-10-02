import { requireAdminPage } from "@/server/auth/guards";
import { listRitualsAdmin } from "@/server/rituals/admin";
import { RitualsManager } from "@/components/admin/content/RitualForm";

export default async function AdminRitualsPage(): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const rituals = await listRitualsAdmin();

  return <RitualsManager initialRituals={rituals} />;
}
