"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { errorText } from "@/components/admin/errors";
import { formatIst } from "@/lib/core/ist";
import { cn } from "@/lib/utils/cn";
import { ADMIN_ROLES, type AdminRole } from "@/lib/domain/enums";
import type { StaffMemberRow } from "@/server/staff/admin";
import {
  changeRoleAction,
  setStaffStatusAction,
  removeStaffAction,
} from "@/server/staff/admin-actions";

export type StaffTableProps = {
  staff: StaffMemberRow[];
  currentAdminId: number;
};

export function StaffTable({
  staff,
  currentAdminId,
}: StaffTableProps): React.JSX.Element {
  const router = useRouter();
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  const handleRoleChange = async (
    userId: number,
    role: AdminRole,
  ): Promise<void> => {
    setPendingUserId(userId);
    try {
      const res = await changeRoleAction({ userId, role });
      if (res.ok) {
        toast.ok("Staff role updated");
        router.refresh();
      } else {
        toast.err(res.message ?? errorText(res.code));
      }
    } catch {
      toast.err(errorText("INTERNAL"));
    } finally {
      setPendingUserId(null);
    }
  };

  const handleStatusToggle = async (
    userId: number,
    nextStatus: "active" | "blocked",
  ): Promise<boolean> => {
    setPendingUserId(userId);
    try {
      const res = await setStaffStatusAction({ userId, status: nextStatus });
      if (res.ok) {
        toast.ok(
          nextStatus === "blocked"
            ? "Staff member blocked"
            : "Staff member activated",
        );
        router.refresh();
        return true;
      } else {
        toast.err(res.message ?? errorText(res.code));
        return false;
      }
    } catch {
      toast.err(errorText("INTERNAL"));
      return false;
    } finally {
      setPendingUserId(null);
    }
  };

  const handleRemove = async (userId: number): Promise<boolean> => {
    setPendingUserId(userId);
    try {
      const res = await removeStaffAction({ userId });
      if (res.ok) {
        toast.ok("Staff access removed");
        router.refresh();
        return true;
      } else {
        toast.err(res.message ?? errorText(res.code));
        return false;
      }
    } catch {
      toast.err(errorText("INTERNAL"));
      return false;
    } finally {
      setPendingUserId(null);
    }
  };

  if (staff.length === 0) {
    return (
      <EmptyState
        icon="user"
        title="No staff members found"
        body="Invite administrative team members to help manage store operations."
      />
    );
  }

  return (
    <div>
      {/* Desktop Table (>= 768px) */}
      <div className="hidden overflow-x-auto rounded-btn bg-cream shadow-ring-sand md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-s2 bg-s1/30">
              <th className="px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink6">
                Name
              </th>
              <th className="px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink6">
                Email
              </th>
              <th className="px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink6">
                Role
              </th>
              <th className="px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink6">
                Status
              </th>
              <th className="px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink6">
                Last Login
              </th>
              <th className="px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink6 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((row) => {
              const isSelf = row.id === currentAdminId;
              const isBusy = pendingUserId === row.id;
              const lastLogin = row.lastLoginAt
                ? new Date(row.lastLoginAt)
                : null;

              return (
                <tr
                  key={row.id}
                  className="border-b border-s2 transition-colors hover:bg-s1 last:border-b-0"
                >
                  <td className="px-4 py-3.5 font-sans text-[14px] text-ink align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">
                        {row.name || "Unnamed staff"}
                      </span>
                      {isSelf && (
                        <span className="inline-flex items-center rounded-pill bg-em1 px-2 py-0.5 text-[11px] font-medium text-em7">
                          You
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-sans text-[13.5px] text-ink6 align-middle font-mono">
                    {row.email || "—"}
                  </td>

                  <td className="px-4 py-3.5 font-sans text-[14px] text-ink align-middle">
                    <div className="relative inline-flex items-center">
                      <select
                        value={row.role}
                        disabled={isSelf || isBusy}
                        onChange={(e) =>
                          handleRoleChange(
                            row.id,
                            e.target.value as AdminRole,
                          )
                        }
                        className="h-8 rounded-field border border-s2 bg-cream pl-2.5 pr-7 font-sans text-[13px] font-medium text-ink transition-colors hover:bg-s1 focus:border-em7 outline-none disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed appearance-none"
                        title={
                          isSelf
                            ? "You cannot change your own role"
                            : undefined
                        }
                      >
                        {ADMIN_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-2 text-ink6">
                        <span className="block size-3.5">
                          <AdminIcon name="chevD" />
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-sans text-[14px] text-ink align-middle">
                    <StatusBadge
                      tone={row.status === "active" ? "ok" : "danger"}
                    >
                      {row.status === "active" ? "Active" : "Blocked"}
                    </StatusBadge>
                  </td>

                  <td className="px-4 py-3.5 font-sans text-[13px] text-ink6 align-middle">
                    {lastLogin
                      ? formatIst(lastLogin, { date: true, time: true })
                      : "Never"}
                  </td>

                  <td className="px-4 py-3.5 font-sans text-[14px] text-ink align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isSelf ? (
                        <span className="text-[12px] italic text-ink6">
                          Current session
                        </span>
                      ) : (
                        <>
                          <ConfirmDialog
                            title={
                              row.status === "active"
                                ? "Block staff member?"
                                : "Activate staff member?"
                            }
                            body={
                              row.status === "active" ? (
                                <span>
                                  Are you sure you want to block{" "}
                                  <strong>{row.name || row.email}</strong>?
                                  Their active sessions will be revoked and they
                                  will be prevented from signing in.
                                </span>
                              ) : (
                                <span>
                                  Are you sure you want to activate{" "}
                                  <strong>{row.name || row.email}</strong>? They
                                  will regain access to the administrative
                                  portal.
                                </span>
                              )
                            }
                            confirmLabel={
                              row.status === "active"
                                ? "Block Member"
                                : "Activate Member"
                            }
                            tone={
                              row.status === "active" ? "danger" : "default"
                            }
                            onConfirm={() =>
                              handleStatusToggle(
                                row.id,
                                row.status === "active"
                                  ? "blocked"
                                  : "active",
                              )
                            }
                            trigger={
                              <button
                                type="button"
                                disabled={isBusy}
                                className={cn(
                                  "inline-flex h-8 items-center px-2.5 rounded-btn border text-[12px] font-semibold transition-colors disabled:opacity-50 cursor-pointer",
                                  row.status === "active"
                                    ? "border-s2 bg-cream text-ink hover:bg-s1 hover:text-sin"
                                    : "border-em7/30 bg-em1 text-em7 hover:bg-em1/80",
                                )}
                              >
                                {row.status === "active"
                                  ? "Block"
                                  : "Activate"}
                              </button>
                            }
                          />

                          <ConfirmDialog
                            title="Remove staff access?"
                            body={
                              <span>
                                Are you sure you want to remove staff access for{" "}
                                <strong>{row.name || row.email}</strong>? Their
                                account will be demoted to a standard customer
                                and all admin sessions will be terminated.
                              </span>
                            }
                            confirmLabel="Remove Access"
                            tone="danger"
                            onConfirm={() => handleRemove(row.id)}
                            trigger={
                              <button
                                type="button"
                                disabled={isBusy}
                                className="inline-flex h-8 items-center px-2.5 rounded-btn border border-sin/30 bg-rose/20 text-[12px] font-semibold text-sin transition-colors hover:bg-rose/40 disabled:opacity-50 cursor-pointer"
                              >
                                Remove
                              </button>
                            }
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (< 768px) */}
      <div className="space-y-3 md:hidden">
        {staff.map((row) => {
          const isSelf = row.id === currentAdminId;
          const isBusy = pendingUserId === row.id;
          const lastLogin = row.lastLoginAt
            ? new Date(row.lastLoginAt)
            : null;

          return (
            <div
              key={row.id}
              className="rounded-btn bg-cream p-4 shadow-ring-sand space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-sans text-[15px] font-bold text-ink truncate">
                      {row.name || "Unnamed staff"}
                    </span>
                    {isSelf && (
                      <span className="inline-flex items-center rounded-pill bg-em1 px-2 py-0.5 text-[11px] font-medium text-em7">
                        You
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[13px] text-ink6 truncate mt-0.5">
                    {row.email || "No email"}
                  </div>
                </div>
                <StatusBadge tone={row.status === "active" ? "ok" : "danger"}>
                  {row.status === "active" ? "Active" : "Blocked"}
                </StatusBadge>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-s2 pt-2.5 text-[13px]">
                <div>
                  <span className="block font-medium text-ink6 text-[11px] uppercase tracking-wider mb-1">
                    Role
                  </span>
                  <div className="relative inline-flex items-center w-full">
                    <select
                      value={row.role}
                      disabled={isSelf || isBusy}
                      onChange={(e) =>
                        handleRoleChange(
                          row.id,
                          e.target.value as AdminRole,
                        )
                      }
                      className="h-8 w-full rounded-field border border-s2 bg-cream pl-2 pr-6 font-sans text-[12.5px] font-medium text-ink transition-colors hover:bg-s1 focus:border-em7 outline-none disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed appearance-none"
                    >
                      {ADMIN_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-1.5 text-ink6">
                      <span className="block size-3.5">
                        <AdminIcon name="chevD" />
                      </span>
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block font-medium text-ink6 text-[11px] uppercase tracking-wider mb-1">
                    Last Login
                  </span>
                  <span className="text-[12.5px] text-ink block pt-1">
                    {lastLogin
                      ? formatIst(lastLogin, { date: true, time: true })
                      : "Never"}
                  </span>
                </div>
              </div>

              {!isSelf && (
                <div className="flex items-center justify-end gap-2 border-t border-s2 pt-2.5">
                  <ConfirmDialog
                    title={
                      row.status === "active"
                        ? "Block staff member?"
                        : "Activate staff member?"
                    }
                    body={
                      row.status === "active" ? (
                        <span>
                          Are you sure you want to block{" "}
                          <strong>{row.name || row.email}</strong>? Their active
                          sessions will be revoked and they will be barred from
                          signing in.
                        </span>
                      ) : (
                        <span>
                          Are you sure you want to activate{" "}
                          <strong>{row.name || row.email}</strong>? They will
                          regain access to the admin portal.
                        </span>
                      )
                    }
                    confirmLabel={
                      row.status === "active"
                        ? "Block Member"
                        : "Activate Member"
                    }
                    tone={row.status === "active" ? "danger" : "default"}
                    onConfirm={() =>
                      handleStatusToggle(
                        row.id,
                        row.status === "active" ? "blocked" : "active",
                      )
                    }
                    trigger={
                      <button
                        type="button"
                        disabled={isBusy}
                        className={cn(
                          "inline-flex h-8 items-center px-3 rounded-btn border text-[12px] font-semibold transition-colors disabled:opacity-50 cursor-pointer",
                          row.status === "active"
                            ? "border-s2 bg-cream text-ink hover:bg-s1 hover:text-sin"
                            : "border-em7/30 bg-em1 text-em7 hover:bg-em1/80",
                        )}
                      >
                        {row.status === "active" ? "Block" : "Activate"}
                      </button>
                    }
                  />

                  <ConfirmDialog
                    title="Remove staff access?"
                    body={
                      <span>
                        Are you sure you want to remove staff access for{" "}
                        <strong>{row.name || row.email}</strong>? Their account
                        will be demoted to a regular customer account and all
                        admin sessions will be terminated.
                      </span>
                    }
                    confirmLabel="Remove Access"
                    tone="danger"
                    onConfirm={() => handleRemove(row.id)}
                    trigger={
                      <button
                        type="button"
                        disabled={isBusy}
                        className="inline-flex h-8 items-center px-3 rounded-btn border border-sin/30 bg-rose/20 text-[12px] font-semibold text-sin transition-colors hover:bg-rose/40 disabled:opacity-50 cursor-pointer"
                      >
                        Remove
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
