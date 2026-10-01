import { requireAdminPage } from "@/server/auth/guards";
import { listStaff } from "@/server/staff/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StaffTable } from "@/components/admin/staff/StaffTable";
import { AddStaffSheet } from "@/components/admin/staff/AddStaffSheet";

export default async function StaffPage(): Promise<React.JSX.Element> {
  const admin = await requireAdminPage("staff.manage");
  const staff = await listStaff();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Permissions"
        description="Manage administrative team members, assign access roles, and control account status."
        actions={<AddStaffSheet />}
      />

      <StaffTable staff={staff} currentAdminId={admin.id} />
    </div>
  );
}
