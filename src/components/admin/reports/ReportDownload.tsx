"use client";

import { useState } from "react";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { monthlyReportCsvAction } from "@/server/reports/actions";

export function ReportDownload({ month, disabled }: { month: string; disabled?: boolean }): React.JSX.Element {
  const [loading, setLoading] = useState(false);

  const download = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await monthlyReportCsvAction(month);
      if (!res.ok) {
        toast.err(res.message || "Could not create the export");
        return;
      }
      const blob = new Blob([res.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.ok(`Downloaded ${res.data.filename}`);
    } catch (err) {
      toast.err(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={disabled || loading}
      className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-em7 px-3.5 font-sans text-[13px] font-semibold text-iv shadow-sm transition-colors hover:bg-em9 disabled:opacity-50 cursor-pointer"
    >
      <div className="size-4">
        <AdminIcon name="download" sw={2} />
      </div>
      {loading ? "Preparing…" : "Download CSV for CA"}
    </button>
  );
}
