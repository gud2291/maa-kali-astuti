import type { OrderStatus, Locale } from "@/lib/domain/enums";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/icons/Icon";

type StepKey = "placed" | "energizing" | "packed" | "shipped" | "delivered";

const STEPS: { key: StepKey; icon: IconName }[] = [
  { key: "placed", icon: "bag" },
  { key: "energizing", icon: "bolt" },
  { key: "packed", icon: "gift" },
  { key: "shipped", icon: "truck" },
  { key: "delivered", icon: "home" },
];

export function OrderTimeline({
  status,
  locale = "en",
  className,
}: {
  status: OrderStatus;
  locale?: Locale;
  className?: string;
}): React.JSX.Element {
  const t = useTranslations("order.timeline");

  if (status === "cancelled") {
    return (
      <div
        className={cn(
          "rounded-field border border-sin/30 bg-sin/5 p-4 text-center sm:p-5",
          className,
        )}
      >
        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-sin/10 text-sin">
          <Icon name="close" className="size-5" />
        </div>
        <p className="font-sans text-base font-bold text-sin">{t("cancelled")}</p>
        <p className="mt-1 font-sans text-xs text-ink6">
          {locale === "hi"
            ? "यह ऑर्डर रद्द कर दिया गया है।"
            : "This order has been cancelled."}
        </p>
      </div>
    );
  }

  if (status === "returned") {
    return (
      <div
        className={cn(
          "rounded-field border border-cu/30 bg-cu/5 p-4 text-center sm:p-5",
          className,
        )}
      >
        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-cu/10 text-cu">
          <Icon name="returns" className="size-5" />
        </div>
        <p className="font-sans text-base font-bold text-cu">{t("returned")}</p>
        <p className="mt-1 font-sans text-xs text-ink6">
          {locale === "hi"
            ? "यह ऑर्डर वापस आ चुका है।"
            : "This order has been returned."}
        </p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);
  // If status is pending_payment, index is -1 (no step reached yet)
  const activeIdx = currentIndex >= 0 ? currentIndex : -1;

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative flex items-center justify-between">
        {/* Connecting track background */}
        <div className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 bg-s2" />

        {/* Completed track progress */}
        {activeIdx > 0 && (
          <div
            className="absolute left-6 top-1/2 h-0.5 -translate-y-1/2 bg-g5 transition-all duration-500"
            style={{
              width: `${(activeIdx / (STEPS.length - 1)) * 100}%`,
            }}
          />
        )}

        {STEPS.map((step, idx) => {
          const isDone = activeIdx > idx;
          const isCurrent = activeIdx === idx;
          const isUpcoming = activeIdx < idx;

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-all duration-300 sm:size-10",
                  isDone && "bg-em7 text-g3 shadow-ring-g5",
                  isCurrent && "bg-g5 text-iv ring-4 ring-g3/30 shadow-card animate-pulse",
                  isUpcoming && "border border-s2 bg-cream text-ink6/50",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? (
                  <Icon name="check" className="size-4 sm:size-5" />
                ) : (
                  <Icon name={step.icon} className="size-4 sm:size-5" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-center font-sans text-[11px] leading-tight sm:text-xs",
                  isCurrent && "font-bold text-em9",
                  isDone && "font-medium text-ink",
                  isUpcoming && "text-ink6/60",
                )}
              >
                {t(step.key)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTimeline;
