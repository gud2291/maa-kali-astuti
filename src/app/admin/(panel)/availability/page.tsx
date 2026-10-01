import { requireAdminPage } from "@/server/auth/guards";
import { getConsultSettings } from "@/server/consult/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AvailabilityForm } from "@/components/admin/consult/AvailabilityForm";

export default async function AdminAvailabilityPage(): Promise<React.JSX.Element> {
  await requireAdminPage("consult.edit");
  const settings = await getConsultSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation Availability"
        description="Set working days, start times for each session length, advance booking limits, and blocked holidays."
      />

      <AvailabilityForm initialSettings={settings} />
    </div>
  );
}
