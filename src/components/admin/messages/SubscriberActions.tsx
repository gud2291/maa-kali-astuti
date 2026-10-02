"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import {
  exportSubscribersCsvAction,
  deleteSubscriberAction,
} from "@/server/messages/admin-actions";

export function SubscriberActions({
  subscriberId,
  exportMode,
}: {
  subscriberId?: number;
  exportMode?: boolean;
}): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  if (exportMode) {
    const handleExport = () => {
      startTransition(async () => {
        const result = await exportSubscribersCsvAction();
        if (result.ok) {
          const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    return (
      <button
        type="button"
        onClick={handleExport}
        disabled={isPending}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3.5 font-sans text-[13px] font-semibold text-ink transition-colors hover:border-em7 disabled:opacity-60"
      >
        <Icon name="download" className="size-3.5" />
        {isPending ? "Exporting…" : "Export CSV"}
      </button>
    );
  }

  if (!subscriberId) return <></>;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSubscriberAction(subscriberId);
      if (result.ok) {
        setShowConfirm(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="relative">
      {showConfirm ? (
        <div className="flex items-center gap-1.5">
          <span className="font-sans text-[12px] font-medium text-rose">Delete?</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="h-7 cursor-pointer rounded-btn border-0 bg-rose px-2.5 font-sans text-[12px] font-semibold text-iv disabled:opacity-60"
          >
            {isPending ? "…" : "Yes"}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className="h-7 cursor-pointer rounded-btn border border-s2 bg-iv px-2.5 font-sans text-[12px] font-semibold text-ink6"
          >
            No
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="grid size-7 cursor-pointer place-items-center rounded-btn border border-s2 bg-iv text-ink6 transition-colors hover:border-rose hover:text-rose"
          aria-label="Delete subscriber"
        >
          <Icon name="trash" className="size-3.5" />
        </button>
      )}
    </div>
  );
}
