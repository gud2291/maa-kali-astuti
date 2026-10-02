import { requireAdminPage } from "@/server/auth/guards";
import { listFaqsAdmin } from "@/server/faqs/admin";
import { FaqsManager } from "@/components/admin/content/FaqForm";

export default async function AdminFaqsPage(): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const faqs = await listFaqsAdmin();

  return <FaqsManager initialFaqs={faqs} />;
}
