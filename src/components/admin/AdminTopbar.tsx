"use client";

import { useEffect, useState } from "react";
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

  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/search") {
      try {
        const q = new URLSearchParams(window.location.search).get("q") || "";
        setQuery(q);
      } catch {
        // ignore
      }
    }
  }, [pathname]);

  const currentNav = nav?.find((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const pageTitle = pathname === "/admin/search" ? "Search" : currentNav?.label ?? "Admin";

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      router.push(`/admin/search?q=${encodeURIComponent(trimmed)}`);
      setMobileSearchOpen(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await logoutAction("admin");
    } finally {
      router.push("/admin/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 flex-none items-center justify-between border-b border-s2 bg-cream px-4 lg:px-8">
      {mobileSearchOpen ? (
        /* Mobile Search Form (full width) */
        <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-ink6">
              <AdminIcon name="search" className="size-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders, products, bookings..."
              autoFocus
              className="w-full rounded-btn border border-s2 bg-iv py-1.5 pl-9 pr-3 font-sans text-[13px] text-ink placeholder:text-ink6 focus:border-g5 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            aria-label="Close search"
            className="grid size-8 place-items-center rounded text-ink6 transition-colors hover:bg-s1 hover:text-ink cursor-pointer"
          >
            <AdminIcon name="close" className="size-4" />
          </button>
        </form>
      ) : (
        <>
          {/* Page Title Slot */}
          <div className="flex items-center gap-3 flex-none">
            <h1 className="font-serif text-[18px] font-bold tracking-tight text-ink lg:text-[20px]">
              {pageTitle}
            </h1>
          </div>

          {/* Desktop Search Bar (>= 1024px) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex flex-1 max-w-[420px] mx-6 items-center"
          >
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-ink6">
                <AdminIcon name="search" className="size-4" />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders, customers, products, bookings..."
                className="w-full rounded-btn border border-s2 bg-iv py-1.5 pl-9 pr-3 font-sans text-[13px] text-ink placeholder:text-ink6 focus:border-g5 focus:outline-none transition-colors"
              />
            </div>
          </form>

          {/* User Menu & Mobile Search Icon */}
          <div className="flex items-center gap-3 sm:gap-4 flex-none">
            {/* Mobile search toggle button (< 1024px) */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Open search input"
              title="Search"
              className="grid size-8 place-items-center rounded text-ink6 transition-colors hover:bg-s1 hover:text-ink lg:hidden cursor-pointer"
            >
              <AdminIcon name="search" className="size-4" />
            </button>

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
        </>
      )}
    </header>
  );
}
