import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdmin } from "@/server/auth/guards";
import { navFor } from "@/components/admin/nav";
import { AdminShell } from "@/components/admin/AdminShell";
import { getBadgeCounts } from "@/server/dashboard/queries";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}): Promise<React.JSX.Element> {
  const admin = await getAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [badges] = await Promise.all([
    getBadgeCounts(),
  ]);

  return (
    <AdminShell admin={admin} nav={navFor(admin.role)} badges={badges}>
      {children}
    </AdminShell>
  );
}
