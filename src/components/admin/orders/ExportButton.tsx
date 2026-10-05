"use client";

import { useState } from "react";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { exportOrdersCsvAction } from "@/server/orders/admin-actions";
import type { OrderListFilters } from "@/lib/validation/order-admin";

export type ExportButtonProps = {
  filters: OrderListFilters;
  disabled?: boolean;
};

export function ExportButton({ filters, disabled }: ExportButtonProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);

  const handleExport = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await exportOrdersCsvAction(filters);
      if (!res.ok) {
        toast.err(res.message || "Could not export orders CSV");
        return;
      }

      const { csv, filename } = res.data;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.ok(`Downloaded ${filename}`);
    } catch (err) {
      toast.err(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || loading}
      className="inline-flex items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink shadow-sm transition-colors hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <div className="h-3.5 w-3.5">
        <AdminIcon name="download" sw={2} />
      </div>
      <span>{loading ? "Exporting..." : "Export CSV"}</span>
    </button>
  );
}
