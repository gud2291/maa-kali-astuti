import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdmin } from "@/server/auth/guards";
import { navFor } from "@/components/admin/nav";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}): Promise<React.JSX.Element> {
  const admin = await getAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <AdminShell admin={admin} nav={navFor(admin.role)}>
      {children}
    </AdminShell>
  );
}
