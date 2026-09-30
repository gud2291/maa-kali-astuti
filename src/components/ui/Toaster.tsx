"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { EASE } from "@/components/motion/easing";
import { useUi, type Toast } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";

/**
 * Toast host — port of SiteChrome.dc.html 350–359 / 421–436 / 543–549.
 * Bottom-centre; on mobile it sits above the tab bar (92px) or the checkout bar (96px).
 * Max three, 4 s (6 s with Undo), enter 300 ms from 14px, exit 220 ms to 10px.
 */
export function Toaster() {
  const toasts = useUi((s) => s.toasts);
  const { tabbar, checkout } = useUi((s) => s.chrome);
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed left-1/2 z-70 flex w-max max-w-[calc(100vw-24px)] -translate-x-1/2 flex-col items-center gap-2",
        tabbar && !checkout ? "bottom-[92px]" : "bottom-24",
        "md:bottom-7",
      )}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}

function ToastItem({ t }: { t: Toast }) {
  const tr = useTranslations("toast");
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && !isReduced())
      ref.current.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 300,
          easing: EASE,
        },
      );
  }, []);

  useEffect(() => {
    if (t.leaving && ref.current && !isReduced())
      ref.current.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(10px)" },
        ],
        {
          duration: 220,
          easing: "ease-in",
          fill: "forwards",
        },
      );
  }, [t.leaving]);

  const dismiss = () => useUi.getState().dismiss(t.id);
  const a = t.action;
  const act = () => {
    if (!a) return;
    if (a.kind === "undo") a.run();
    else if (a.kind === "cart") useUi.getState().openCart();
    else router.push(a.href);
    dismiss();
  };

  return (
    <div
      ref={ref}
      role="status"
      className="pointer-events-auto flex max-w-full min-w-[260px] items-center gap-3 rounded-btn bg-em9 py-2.5 pr-2.5 pl-4 font-sans text-[14px] leading-[1.35] font-medium text-iv shadow-[0_18px_40px_-16px_rgba(10,31,26,.6),inset_0_0_0_1px_rgba(217,185,106,.3)]"
    >
      <span className={cn("block size-[18px] flex-none", t.tone === "err" ? "text-rose" : "text-g3")}>
        <Icon name={t.tone === "ok" ? "checkc" : t.tone === "err" ? "alert" : "info"} />
      </span>
      <span className="flex-1">{t.msg}</span>
      {a && (
        <button
          type="button"
          onClick={act}
          className="cursor-pointer border-0 bg-transparent px-2 py-1.5 font-sans text-[13px] leading-none font-bold whitespace-nowrap text-g3"
        >
          {a.kind === "undo" ? (a.label ?? tr("undo")) : a.label}
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label={tr("dismiss")}
        className="grid size-[30px] cursor-pointer place-items-center border-0 bg-transparent text-em1"
      >
        <span className="block size-3.5">
          <Icon name="close" />
        </span>
      </button>
    </div>
  );
}
