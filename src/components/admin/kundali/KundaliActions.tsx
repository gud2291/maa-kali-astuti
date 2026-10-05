"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "@/components/admin/AdminIcon";
import {
  regenerateKundaliAction,
  resendKundaliEmailAction,
} from "@/server/kundali/admin-actions";
import { toast } from "@/components/admin/ui/toast";

type Props = {
  id: number;
  status: string;
  refCode: string;
  hasEmail: boolean;
};

export function KundaliActions({ id, status, refCode, hasEmail }: Props): React.JSX.Element {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleRegenerate = async () => {
    if (!confirm(`Are you sure you want to regenerate the Kundali report for ${refCode}?`)) {
      return;
    }

    setIsRegenerating(true);
    try {
      const res = await regenerateKundaliAction({ id });
      if (res.ok) {
        toast.ok(`Report status: ${res.data.status}`);
        router.refresh();
      } else {
        toast.err(`Regeneration failed: ${res.code}`);
      }
    } catch {
      toast.err("Regeneration error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const res = await resendKundaliEmailAction({ id });
      if (res.ok) {
        toast.ok("Ready email resent to customer");
        router.refresh();
      } else {
        toast.err(`Failed to resend email: ${res.code}`);
      }
    } catch {
      toast.err("Error resending email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={isRegenerating}
        className="inline-flex h-[38px] cursor-pointer items-center gap-2 rounded-btn bg-em7 px-4 font-sans text-[13.5px] font-semibold text-iv shadow hover:bg-em5 disabled:opacity-50"
      >
        <AdminIcon name="clock" className={`size-4 ${isRegenerating ? "animate-spin" : ""}`} />
        {isRegenerating ? "Regenerating..." : "Regenerate Report"}
      </button>

      <button
        type="button"
        onClick={handleResendEmail}
        disabled={isResending || !hasEmail || status !== "ready"}
        title={!hasEmail ? "Customer did not provide an email" : undefined}
        className="inline-flex h-[38px] cursor-pointer items-center gap-2 rounded-btn border border-s2 bg-iv px-4 font-sans text-[13.5px] font-semibold text-ink shadow-sm hover:bg-s1 disabled:opacity-40"
      >
        <AdminIcon name="mail" className={`size-4 ${isResending ? "animate-spin" : ""}`} />
        {isResending ? "Resending..." : "Resend Email"}
      </button>
    </div>
  );
}
