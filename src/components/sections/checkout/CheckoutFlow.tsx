"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCartLines } from "@/stores/cart";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";
import { useCheckout, type CheckoutStep } from "./useCheckout";
import { useQuote } from "./useQuote";
import { StepContact } from "./StepContact";
import { StepAddress } from "./StepAddress";
import { StepDelivery } from "./StepDelivery";
import { StepPayment } from "./StepPayment";
import { StepReview } from "./StepReview";
import { CheckoutSummary } from "./CheckoutSummary";
import type { SavedAddress } from "@/server/account/queries";

export type CheckoutPrefill = {
  contact?: { name: string; email: string; phone: string };
  addresses: SavedAddress[];
  isSignedIn: boolean;
};

export function CheckoutFlow({ prefill }: { prefill?: CheckoutPrefill }) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const hydrated = useHydrated();
  const lines = useCartLines();

  const { step, setStep } = useCheckout();
  const { quote, refetch } = useQuote();
  const headRef = useRef<HTMLHeadingElement>(null);

  // Redirect to /cart if cart is empty
  useEffect(() => {
    if (hydrated && lines.length === 0) {
      router.replace(routes.cart);
    }
  }, [hydrated, lines.length, router]);

  const goToStep = (s: CheckoutStep) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated || lines.length === 0) {
    return (
      <main className="min-h-[70vh] bg-iv py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-8 animate-spin rounded-pill border-2 border-em7 border-t-transparent" />
          <p className="font-sans text-[14px] text-ink6">{t("loadingCheckout")}</p>
        </div>
      </main>
    );
  }

  const STEPS: { num: CheckoutStep; label: string }[] = [
    { num: 1, label: t("steps.contact") },
    { num: 2, label: t("steps.address") },
    { num: 3, label: t("steps.delivery") },
    { num: 4, label: t("steps.payment") },
    { num: 5, label: t("steps.review") },
  ];

  return (
    <main className="min-h-screen bg-iv py-6 md:py-10">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Mobile collapsible summary at the top (<1024px) */}
        <CheckoutSummary quote={quote} refetchQuote={refetch} variant="mobile" />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Main flow column (8 cols on desktop) */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Stepper Progress Bar */}
            <nav aria-label={t("stepsAria")} className="rounded-btn border border-s2 bg-cream p-4 md:p-5">
              <ol className="relative m-0 grid list-none grid-cols-5 gap-1 p-0">
                {/* Background baseline */}
                <span
                  aria-hidden="true"
                  className="absolute top-[20px] right-[10%] left-[10%] h-px bg-s2"
                />
                {/* Filled progress line */}
                <span
                  aria-hidden="true"
                  className="absolute top-[20px] right-[10%] left-[10%] h-px origin-left bg-g5 transition-transform duration-500 ease-mka"
                  style={{ transform: `scaleX(${Math.min(step - 1, 4) / 4})` }}
                />

                {STEPS.map(({ num, label }) => {
                  const done = num < step;
                  const cur = num === step;
                  return (
                    <li key={num} className="relative flex justify-center">
                      <button
                        type="button"
                        onClick={() => done && goToStep(num)}
                        disabled={!done}
                        aria-current={cur ? "step" : undefined}
                        className={cn(
                          "flex min-w-10 flex-col items-center gap-1.5 border-0 bg-transparent px-0.5",
                          done ? "cursor-pointer" : "cursor-default",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-10 place-items-center rounded-pill font-sans text-[13px] font-bold transition-all duration-300",
                            done
                              ? "bg-em7 text-iv shadow-sm"
                              : cur
                                ? "bg-em9 text-iv shadow-[inset_0_0_0_1px_#0E3B30,0_0_0_3px_rgba(184,146,58,.3)]"
                                : "bg-iv text-ink6 shadow-ring-sand",
                          )}
                        >
                          {done ? <Icon name="check" className="size-4" /> : num}
                        </span>
                        <span
                          className={cn(
                            "text-center font-sans text-[11px] md:text-[12px] font-semibold leading-tight",
                            cur ? "text-em9" : done ? "text-em7" : "text-ink6",
                          )}
                        >
                          {label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Current Step Content */}
            <div className="rounded-btn border border-s2 bg-cream p-5 md:p-8 shadow-sm">
              {step === 1 && (
                <StepContact
                  quote={quote}
                  prefill={prefill}
                  onNext={() => goToStep(2)}
                />
              )}
              {step === 2 && (
                <StepAddress
                  prefill={prefill}
                  onNext={() => goToStep(3)}
                  onBack={() => goToStep(1)}
                />
              )}
              {step === 3 && (
                <StepDelivery
                  quote={quote}
                  onNext={() => goToStep(4)}
                  onBack={() => goToStep(2)}
                />
              )}
              {step === 4 && (
                <StepPayment
                  quote={quote}
                  onNext={() => goToStep(5)}
                  onBack={() => goToStep(3)}
                />
              )}
              {step === 5 && (
                <StepReview
                  quote={quote}
                  refetchQuote={refetch}
                  onGoToStep={goToStep}
                  onBack={() => goToStep(4)}
                />
              )}
            </div>
          </div>

          {/* Desktop aside column (4 cols on desktop >=1024px) */}
          <div className="hidden lg:block lg:col-span-4">
            <CheckoutSummary quote={quote} refetchQuote={refetch} variant="desktop" />
          </div>
        </div>
      </div>
    </main>
  );
}
