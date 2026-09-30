"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { scrollToId } from "@/components/layout/scroll";
import { cn } from "@/lib/utils/cn";

/* Sticky Book bar (Consultation-Detail.dc.html 164–172, ctaRef 225). Appears once the hero's CTA row
   (#`targetId`) has scrolled above the viewport, and hides again when it comes back.
   Mobile: pinned to the bottom (72px + safe area, top hairline), sliding up from 110%.
   ≥768: pinned under the 64px compact header (64px, brass bottom hairline) with the service icon,
   sliding down from −100% − 72px. 380 ms EASE. While hidden it is aria-hidden and untabbable.
   Course-Detail (183–191) reuses it with a yantra disc as `lead` and an in-page `anchor` (#enquire)
   instead of a link. */
const CTA =
  "inline-flex h-[46px] flex-none items-center gap-[9px] rounded-btn bg-em7 px-5 font-sans text-[14.5px] leading-none font-semibold text-iv no-underline shadow-ring-gold hover:bg-em5 hover:text-iv";

export function StickyBook({
  targetId,
  icon,
  name,
  sub,
  href,
  anchor,
  label,
  lead,
  ctaIcon = "calendar",
}: {
  targetId: string;
  icon?: IconName;
  /** Replaces the icon disc (≥768 only), e.g. the course yantra. */
  lead?: ReactNode;
  name: string;
  /** "from ₹2,100 · 60–90 min" */
  sub: string;
  href?: string;
  /** In-page target id: the button scrolls there (60px offset) instead of navigating. */
  anchor?: string;
  label: string;
  ctaIcon?: IconName;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);

  return (
    <div
      aria-hidden={!on}
      className={cn(
        "fixed inset-x-0 bottom-0 z-55 bg-iv pb-[env(safe-area-inset-bottom)] shadow-[inset_0_1px_0_#EAE0CA] transition-transform duration-[380ms] ease-mka md:top-16 md:bottom-auto md:pb-0 md:shadow-[inset_0_-1px_0_rgba(184,146,58,.45)]",
        on ? "" : "translate-y-[110%] md:translate-y-[calc(-100%_-_72px)]",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-3.5 px-[clamp(16px,4vw,32px)] md:h-16">
        <span className="flex min-w-0 items-center gap-3">
          {lead ??
            (icon && (
              <span className="grid size-[38px] flex-none place-items-center rounded-pill bg-s1 text-em7 max-md:hidden">
                <Icon name={icon} className="size-5" />
              </span>
            ))}
          <span className="flex min-w-0 flex-col gap-1">
            <span
              lang="en"
              className="overflow-hidden font-display text-[18px] leading-[1.1] font-normal text-ellipsis whitespace-nowrap text-em9"
            >
              {name}
            </span>
            <span className="font-sans text-[12.5px] leading-none font-semibold text-ink6 tabular">{sub}</span>
          </span>
        </span>
        {anchor ? (
          <a
            href={`#${anchor}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToId(anchor);
            }}
            tabIndex={on ? 0 : -1}
            className={CTA}
          >
            <Icon name={ctaIcon} className="size-[17px]" />
            {label}
          </a>
        ) : (
          <Link href={href ?? "/"} tabIndex={on ? 0 : -1} className={CTA}>
            <Icon name={ctaIcon} className="size-[17px]" />
            {label}
          </Link>
        )}
      </div>
    </div>
  );
}
