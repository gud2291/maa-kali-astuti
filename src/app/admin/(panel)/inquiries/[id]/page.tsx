import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { getInquiryAdmin, listStaffUsers } from "@/server/inquiries/admin";
import { getSetting } from "@/server/settings/queries";
import { InquiryDetail } from "@/components/admin/inquiries/InquiryDetail";

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("inquiries.view");

  const { id } = await params;
  const inquiryId = parseInt(id, 10);
  if (isNaN(inquiryId)) {
    notFound();
  }

  try {
    const [inquiry, staffUsers, courseSettings] = await Promise.all([
      getInquiryAdmin(inquiryId),
      listStaffUsers(),
      getSetting("courses"),
    ]);

    return (
      <InquiryDetail
        inquiry={inquiry}
        staffUsers={staffUsers}
        courseSettings={courseSettings}
      />
    );
  } catch {
    notFound();
  }
}
