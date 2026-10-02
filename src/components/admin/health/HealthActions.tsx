"use client";

import { useState } from "react";
import { AdminIcon } from "@/components/admin/AdminIcon";

export type HealthActionsProps = {
  ownerEmail: string;
  onSendTestEmail: () => Promise<{ success: boolean; to: string }>;
  onRecalculateRatings: () => Promise<{ success: boolean; count: number }>;
};

export function HealthActions({
  ownerEmail,
  onSendTestEmail,
  onRecalculateRatings,
}: HealthActionsProps): React.JSX.Element {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<string | null>(null);

  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingResult, setRatingResult] = useState<string | null>(null);

  const handleSendTestEmail = async (): Promise<void> => {
    if (
      !window.confirm(
        `Send a system test email to the owner address (${ownerEmail})?`,
      )
    ) {
      return;
    }

    setEmailLoading(true);
    setEmailResult(null);
    try {
      const res = await onSendTestEmail();
      setEmailResult(`Test email dispatched successfully to ${res.to}`);
    } catch (err) {
      setEmailResult(
        err instanceof Error ? err.message : "Failed to send test email.",
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleRecalculateRatings = async (): Promise<void> => {
    if (
      !window.confirm(
        "Recalculate star ratings for all products based on approved reviews? Products without approved reviews will reset to 0.",
      )
    ) {
      return;
    }

    setRatingLoading(true);
    setRatingResult(null);
    try {
      const res = await onRecalculateRatings();
      setRatingResult(`Successfully updated ratings for ${res.count} products.`);
    } catch (err) {
      setRatingResult(
        err instanceof Error ? err.message : "Failed to recalculate ratings.",
      );
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2 space-y-5">
      <div>
        <h3 className="font-serif text-[18px] font-bold text-ink">
          Maintenance Actions
        </h3>
        <p className="mt-0.5 font-sans text-[12px] text-ink6">
          Safe operational tasks and integration checks (audited)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Test Email Card */}
        <div className="flex flex-col justify-between rounded-btn border border-s2 bg-iv p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded bg-s1 text-em7">
                <AdminIcon name="mail" className="size-4" />
              </span>
              <h4 className="font-sans text-[14px] font-semibold text-ink">
                Send Test Email
              </h4>
            </div>
            <p className="mt-2 font-sans text-[12.5px] leading-relaxed text-ink6">
              Sends a verification email to the owner address (<strong>{ownerEmail}</strong>) to verify Resend delivery.
            </p>
          </div>

          <div className="mt-4">
            <button
              type="button"
              disabled={emailLoading}
              onClick={handleSendTestEmail}
              className="inline-flex items-center gap-1.5 rounded-btn bg-em7 px-3 py-1.5 font-sans text-[12.5px] font-semibold text-iv transition-colors hover:bg-em5 disabled:opacity-50 cursor-pointer"
            >
              <AdminIcon name="mail" className="size-3.5" />
              <span>{emailLoading ? "Sending..." : "Dispatch Email"}</span>
            </button>
            {emailResult && (
              <p className="mt-2 font-sans text-[11.5px] text-ink">{emailResult}</p>
            )}
          </div>
        </div>

        {/* Recalculate Ratings Card */}
        <div className="flex flex-col justify-between rounded-btn border border-s2 bg-iv p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded bg-s1 text-g7">
                <AdminIcon name="star" className="size-4" />
              </span>
              <h4 className="font-sans text-[14px] font-semibold text-ink">
                Recalculate Product Ratings
              </h4>
            </div>
            <p className="mt-2 font-sans text-[12.5px] leading-relaxed text-ink6">
              Scans all approved reviews across the catalogue and updates product average ratings and review counts.
            </p>
          </div>

          <div className="mt-4">
            <button
              type="button"
              disabled={ratingLoading}
              onClick={handleRecalculateRatings}
              className="inline-flex items-center gap-1.5 rounded-btn bg-g7 px-3 py-1.5 font-sans text-[12.5px] font-semibold text-iv transition-colors hover:bg-g5 disabled:opacity-50 cursor-pointer"
            >
              <AdminIcon name="star" className="size-3.5" />
              <span>{ratingLoading ? "Processing..." : "Recalculate All"}</span>
            </button>
            {ratingResult && (
              <p className="mt-2 font-sans text-[11.5px] text-ink">{ratingResult}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
