"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { waLink } from "@/lib/site";
import { scrollToTop } from "./scroll";

/**
 * WhatsApp FAB (SiteChrome.dc.html 339–342, 539): gold ring pulses every 8 s (`data-amb`, so it
 * pauses offscreen / hidden tab / reduced motion). Mobile bottom offset: above the tab bar
 * (84px), 20px while the bar is hidden, or the page's `fabLift` when there is no tab bar.
 * ≥768: 24px.
 */
export function WhatsAppFab({ bottom }: { bottom: string }) {
  const t = useTranslations("chrome");
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("fab")}
      style={{ "--fab-b": bottom } as CSSProperties}
      className="fixed right-[18px] bottom-[var(--fab-b)] z-50 grid size-14 place-items-center rounded-pill bg-em7 text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55),0_14px_30px_-12px_rgba(14,59,48,.55)] transition-[bottom] duration-[320ms] ease-mka md:bottom-6"
    >
      <span
        aria-hidden
        data-amb="pulse:8"
        className="pointer-events-none absolute inset-0 rounded-pill shadow-[0_0_0_1.5px_#B8923A]"
      />
      <span className="block size-[26px]">
        <Icon name="whatsapp" />
      </span>
    </a>
  );
}

/**
 * Back-to-top (SiteChrome.dc.html 343–348, 418–419, 540–541): ≥768 once past 700px. The gold
 * ring fills with page progress; it is written straight to the SVG on each scroll frame.
 */
export function BackToTop() {
  const t = useTranslations("chrome");
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    const frame = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      ring.current?.style.setProperty("stroke-dashoffset", String(1 - Math.min(1, window.scrollY / Math.max(1, h))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t("toTop")}
      className="fixed right-6 bottom-[92px] z-50 hidden size-11 cursor-pointer place-items-center rounded-pill border-0 bg-iv text-em7 shadow-[0_10px_24px_-12px_rgba(14,59,48,.45)] md:grid"
    >
      <svg viewBox="0 0 44 44" width="100%" height="100%" aria-hidden className="absolute inset-0 block">
        <circle cx="22" cy="22" r="20.5" fill="none" stroke="#EAE0CA" strokeWidth="1.5" />
        <circle
          ref={ring}
          cx="22"
          cy="22"
          r="20.5"
          fill="none"
          stroke="#B8923A"
          strokeWidth="1.5"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className="block size-[18px]">
        <Icon name="arrowU" />
      </span>
    </button>
  );
}
