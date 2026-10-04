"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { retryPaymentAction, confirmPaymentAction } from "@/server/payments/actions";
import { openRazorpay } from "@/lib/payments/razorpay-client";
import { Icon } from "@/components/icons/Icon";

export function PayNow({
  number,
  accessKey,
}: {
  number: string;
  accessKey: string;
}): React.JSX.Element {
  const t = useTranslations("order");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayNow = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await retryPaymentAction({
        entity: "order",
        ref: number,
        accessKey,
      });

      if (!res.ok) {
        // CONFLICT = already paid / processed.
        if (res.code === "CONFLICT") {
          router.refresh();
          return;
        }
        setError(t("paymentIncomplete"));
        return;
      }

      const payResult = await openRazorpay(res.data.rzp);

      if (payResult.status === "paid") {
        const confirmRes = await confirmPaymentAction({
          entity: "order",
          ref: number,
          razorpay_order_id: payResult.razorpay_order_id,
          razorpay_payment_id: payResult.razorpay_payment_id,
          razorpay_signature: payResult.razorpay_signature,
        });

        if (confirmRes.ok) {
          router.refresh();
        } else {
          setError(t("paymentIncomplete"));
        }
      } else if (payResult.status === "dismissed") {
        setError(t("paymentIncomplete"));
      } else {
        setError(payResult.reason || t("paymentIncomplete"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("paymentIncomplete"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handlePayNow}
        disabled={loading}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-em7 px-6 font-sans text-sm font-semibold tracking-wide text-iv shadow-ring-gold hover:bg-em9 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon name="lock" className="size-4 text-g3" />
        <span>{loading ? t("processing") : t("payNow")}</span>
      </button>

      {error && (
        <p className="font-sans text-xs font-medium text-sin mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
