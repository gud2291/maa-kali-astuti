"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { AdminIcon } from "./AdminIcon";
import type { NavItem } from "./nav";
import { cn } from "@/lib/utils/cn";

export type AdminMobileNavProps = {
  nav: NavItem[];
};

export function AdminMobileNav({ nav }: AdminMobileNavProps): React.JSX.Element {
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  const first4 = nav.slice(0, 4);
  const groups = Array.from(new Set(nav.map((i) => i.group)));

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-s2 bg-cream pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex h-14 items-stretch justify-around">
          {first4.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center min-h-[44px] px-1 py-1 font-sans text-[11px] transition-colors",
                  isActive
                    ? "font-semibold text-em7"
                    : "font-medium text-ink6 hover:text-ink",
                )}
              >
                <AdminIcon
                  name={item.icon}
                  className={cn("size-5 mb-0.5", isActive ? "text-em7" : "text-ink6")}
                />
                <span className="max-w-[64px] truncate text-center leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="Open full admin menu"
            className="flex flex-1 flex-col items-center justify-center min-h-[44px] px-1 py-1 font-sans text-[11px] font-medium text-ink6 transition-colors hover:text-ink cursor-pointer"
          >
            <AdminIcon name="menu" className="size-5 mb-0.5 text-ink6" />
            <span className="leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* Radix Dialog sheet for all items */}
      <Dialog.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-n9/60 backdrop-blur-xs transition-opacity" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-s2 bg-cream p-5 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-fly outline-none">
            <div className="flex items-center justify-between border-b border-s2 pb-3">
              <Dialog.Title className="font-serif text-[18px] font-bold text-ink">
                Admin Navigation
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close navigation sheet"
                  className="grid size-8 place-items-center rounded text-ink6 transition-colors hover:bg-s1 hover:text-ink cursor-pointer"
                >
                  <AdminIcon name="close" className="size-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-4 space-y-4">
              {groups.map((group) => {
                const groupItems = nav.filter((i) => i.group === group);
                if (groupItems.length === 0) return null;

                return (
                  <div key={group} className="space-y-1.5">
                    <div className="px-1 font-sans text-[11px] font-bold uppercase tracking-wider text-g7">
                      {group}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {groupItems.map((item) => {
                        const isActive =
                          item.href === "/admin"
                            ? pathname === "/admin"
                            : pathname === item.href ||
                              pathname.startsWith(item.href + "/");

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMoreOpen(false)}
                            className={cn(
                              "flex min-h-[44px] items-center gap-2.5 rounded-btn p-2.5 font-sans text-[13px] font-medium transition-colors",
                              isActive
                                ? "bg-em7 text-iv font-semibold"
                                : "bg-s1/60 text-ink hover:bg-s1",
                            )}
                          >
                            <AdminIcon
                              name={item.icon}
                              className={cn(
                                "size-4 flex-none",
                                isActive ? "text-iv" : "text-em7",
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
