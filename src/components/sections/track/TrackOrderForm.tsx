"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { trackOrderAction } from "@/server/orders/actions";
import { TrackResult } from "./TrackResult";
import type { OrderTrackingView } from "@/server/orders/queries";

export function TrackOrderForm(): React.JSX.Element {
  const t = useTranslations("track");
  const te = useTranslations("errors");
  const [number, setNumber] = useState("");
  const [contact, setContact] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderTrackingView | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedNumber = number.trim().toUpperCase();
    const trimmedContact = contact.trim();

    if (!trimmedNumber || !trimmedContact) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await trackOrderAction({
          number: trimmedNumber,
          contact: trimmedContact,
          turnstileToken: turnstileToken ?? undefined,
        });

        if (!res.ok) {
          setError(res.code === "NOT_FOUND" ? t("notFound") : te(res.code));
          setResetKey((k) => k + 1);
          setTurnstileToken(null);
          return;
        }

        setResult(res.data);
      } catch {
        setError(te("INTERNAL"));
        setResetKey((k) => k + 1);
        setTurnstileToken(null);
      }
    });
  };

  if (result) {
    return (
      <TrackResult
        order={result}
        onReset={() => {
          setResult(null);
          setError(null);
          setResetKey((k) => k + 1);
          setTurnstileToken(null);
        }}
      />
    );
  }

  return (
    <div className="rounded-btn border border-s2 bg-cream p-6 sm:p-8 shadow-sm">
      <div className="mb-6 text-center">
        <span className="font-sans text-[11px] font-semibold tracking-widest text-g7 uppercase">
          {t("title")}
        </span>
        <h1 className="mt-1 font-title text-2xl font-bold text-em9 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-xs text-ink6 sm:text-sm">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Order Number Field */}
        <div>
          <label
            htmlFor="track-order-number"
            className="mb-1.5 block font-sans text-xs font-semibold text-em9"
          >
            {t("orderNumberLabel")}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-g5">
              <Icon name="bag" className="size-4" />
            </span>
            <input
              id="track-order-number"
              type="text"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value.toUpperCase())}
              placeholder={t("orderNumberPlaceholder")}
              autoCapitalize="characters"
              autoComplete="off"
              className="h-11 w-full rounded-field border border-s2 bg-iv pl-10 pr-3.5 font-sans text-sm text-ink outline-none transition-colors focus:border-em7 focus:ring-1 focus:ring-em7"
            />
          </div>
        </div>

        {/* Contact (Phone or Email) Field */}
        <div>
          <label
            htmlFor="track-contact"
            className="mb-1.5 block font-sans text-xs font-semibold text-em9"
          >
            {t("contactLabel")}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-g5">
              <Icon name="user" className="size-4" />
            </span>
            <input
              id="track-contact"
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t("contactPlaceholder")}
              autoComplete="email tel"
              className="h-11 w-full rounded-field border border-s2 bg-iv pl-10 pr-3.5 font-sans text-sm text-ink outline-none transition-colors focus:border-em7 focus:ring-1 focus:ring-em7"
            />
          </div>
        </div>

        {/* Cloudflare Turnstile */}
        <TurnstileWidget
          action="track_order"
          onToken={setTurnstileToken}
          resetKey={resetKey}
        />

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-field border border-sin/30 bg-sin/10 p-3 text-xs text-sin"
          >
            <Icon name="close" className="size-4 flex-none" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-btn bg-em7 font-sans text-sm font-semibold tracking-wide text-iv shadow-md transition-colors hover:bg-em5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-iv border-t-transparent" />
              <span>{t("tracking")}</span>
            </>
          ) : (
            <>
              <Icon name="search" className="size-4" />
              <span>{t("submit")}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
