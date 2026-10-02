"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { AdminIcon } from "./AdminIcon";
import type { NavItem } from "./nav";
import type { BadgeCounts } from "@/server/dashboard/queries";
import { cn } from "@/lib/utils/cn";

export type AdminSidebarProps = {
  nav: NavItem[];
  badges?: BadgeCounts;
};

export function AdminSidebar({ nav, badges }: AdminSidebarProps): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mka.admin.collapsed");
      if (saved === "true") setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mka.admin.collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const groups = Array.from(new Set(nav.map((i) => i.group)));

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col flex-none min-h-screen bg-n9 transition-[width] duration-200 border-r border-[rgba(217,185,106,0.15)] select-none",
        collapsed ? "w-[72px]" : "w-[248px]",
      )}
    >
      {/* Brand header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-[rgba(217,185,106,0.15)]",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Link
          href="/admin"
          className="flex items-center gap-2.5 no-underline outline-none"
          title="Maa Kali Astuti Admin"
        >
          <Logo uid="admin-sidebar" className="h-8 w-auto text-iv flex-none" />
          {!collapsed && (
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-g3">
              Admin
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Collapse sidebar"
            className="grid size-7 place-items-center rounded text-sg3 transition-colors hover:bg-n8 hover:text-g1 cursor-pointer"
          >
            <AdminIcon name="chevL" className="size-4" />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {groups.map((group) => {
          const groupItems = nav.filter((i) => i.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group} className="space-y-1">
              {!collapsed ? (
                <div className="px-4 py-1 font-sans text-[11px] font-semibold uppercase tracking-wider text-sg5">
                  {group}
                </div>
              ) : (
                <div className="my-1 border-t border-[rgba(217,185,106,0.1)]" />
              )}
              {groupItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                const badgeKey = item.badge;
                const badgeCount = badgeKey && badges ? badges[badgeKey] : 0;
                const displayCount =
                  badgeCount > 99 ? "99+" : badgeCount > 0 ? String(badgeCount) : null;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? `${item.label}${displayCount ? ` (${displayCount})` : ""}` : undefined}
                    className={cn(
                      "group relative flex items-center transition-colors font-sans text-[13.5px] font-medium rounded",
                      collapsed
                        ? "justify-center px-0 py-3 mx-2"
                        : "gap-3 px-3.5 py-2.5 mx-2",
                      isActive
                        ? "bg-n8 text-g1 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-g5"
                        : "text-sg3 hover:bg-n8/60 hover:text-g1",
                    )}
                  >
                    <span className="relative block size-5 flex-none">
                      <AdminIcon
                        name={item.icon}
                        className={cn(
                          "size-5 transition-colors",
                          isActive ? "text-g1" : "text-sg3 group-hover:text-g1",
                        )}
                      />
                      {collapsed && displayCount && (
                        <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-pill bg-em7 px-1 font-sans text-[9px] font-bold text-iv leading-none">
                          {displayCount}
                        </span>
                      )}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{item.label}</span>
                        {displayCount && (
                          <span className="ml-auto rounded-pill bg-em7 px-1.5 py-0.5 font-sans text-[10.5px] font-bold text-iv leading-none">
                            {displayCount}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer / Expand button when collapsed */}
      {collapsed && (
        <div className="border-t border-[rgba(217,185,106,0.15)] p-2">
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Expand sidebar"
            className="flex w-full items-center justify-center rounded py-2 text-sg3 transition-colors hover:bg-n8 hover:text-g1 cursor-pointer"
          >
            <AdminIcon name="chevR" className="size-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
