import { requireAdminPage } from "@/server/auth/guards";
import { getPeriodEntries, coverage } from "@/server/rashifal/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { RashifalEditor } from "@/components/admin/rashifal/RashifalEditor";
import { istDayKey, addDaysKey } from "@/lib/core/ist";

export default async function AdminRashifalPage(): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const todayKey = istDayKey(Date.now());
  const initialEntries = await getPeriodEntries("day", todayKey);
  const initialCoverage = await coverage(todayKey, addDaysKey(todayKey, 60));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rashifal Manager"
        description="Write and schedule daily, weekly, monthly, and yearly predictions for the 12 rashis."
      />

      <RashifalEditor
        initialEntries={initialEntries}
        initialCoverage={initialCoverage}
        todayKey={todayKey}
      />
    </div>
  );
}
