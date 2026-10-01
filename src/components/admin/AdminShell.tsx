import type { ReactNode } from "react";
import type { AdminUser } from "@/server/auth/guards";
import type { NavItem } from "./nav";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminMobileNav } from "./AdminMobileNav";

export type AdminShellProps = {
  admin: AdminUser;
  nav: NavItem[];
  children: ReactNode;
};

export function AdminShell({
  admin,
  nav,
  children,
}: AdminShellProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-iv text-ink">
      <div className="lg:flex">
        <AdminSidebar nav={nav} />
        <div className="flex flex-1 flex-col min-h-screen min-w-0">
          <AdminTopbar admin={admin} nav={nav} />
          <main className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
            {children}
          </main>
        </div>
      </div>
      <AdminMobileNav nav={nav} />
    </div>
  );
}
