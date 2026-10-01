"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/server/auth/actions";
import type { AdminUser } from "@/server/auth/guards";
import { AdminIcon } from "./AdminIcon";
import type { NavItem } from "./nav";

export type AdminTopbarProps = {
  admin: AdminUser;
  nav?: NavItem[];
};

export function AdminTopbar({ admin, nav }: AdminTopbarProps): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  const currentNav = nav?.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const pageTitle = currentNav?.label ?? "Admin";

  const handleSignOut = async (): Promise<void> => {
    try {
      await logoutAction("admin");
    } finally {
      router.push("/admin/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 flex-none items-center justify-between border-b border-s2 bg-cream px-4 lg:px-8">
      {/* Page Title Slot */}
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-[18px] font-bold tracking-tight text-ink lg:text-[20px]">
          {pageTitle}
        </h1>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* View storefront */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded px-2.5 py-1.5 font-sans text-[12.5px] font-medium text-ink6 transition-colors hover:bg-s1 hover:text-em7"
          title="View live site in a new tab"
        >
          <AdminIcon name="globe" className="size-4" />
          <span className="hidden sm:inline">View site</span>
        </Link>

        <div className="h-4 w-px bg-s2" />

        {/* User Info & Logout */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col text-right">
            <span className="max-w-[140px] truncate font-sans text-[13px] font-semibold leading-tight text-ink sm:max-w-[200px]">
              {admin.name || admin.email}
            </span>
            <span className="font-sans text-[10.5px] font-medium uppercase tracking-wider text-g7">
              {admin.role}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="grid size-8 place-items-center rounded text-ink6 transition-colors hover:bg-s1 hover:text-sin cursor-pointer"
          >
            <AdminIcon name="logout" className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
