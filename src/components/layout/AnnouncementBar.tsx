"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { WHATSAPP_DISPLAY, waLink } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { useSwitchLocale } from "./useSwitchLocale";

/**
 * 32px emerald strip (SiteChrome.dc.html 18–40, 406, 446–448, 466–470): three messages rotate
 * every 4.2 s (520 ms slide); a copy of the first closes the loop and snaps back after 560 ms.
 * Pauses while the tab is hidden or the bar is scrolled away (`paused`).
 * ≥768: WhatsApp number + EN | हिं toggle on the right.
 */
export function AnnouncementBar({ paused }: { paused: boolean }) {
  const t = useTranslations("chrome");
  const msgs = t.raw("ann") as string[];
  const { hi, setLocale } = useSwitchLocale();
  const [{ i, tr }, setRot] = useState({ i: 0, tr: true });
  const iRef = useRef(0);

  useEffect(() => {
    if (paused) return;
    const n = msgs.length;
    let reset: ReturnType<typeof setTimeout> | undefined;
    const home = () => {
      iRef.current = 0;
      setRot({ i: 0, tr: false });
    };
    const id = setInterval(() => {
      if (document.hidden) return;
      iRef.current += 1;
      setRot({ i: iRef.current, tr: true });
      if (iRef.current === n) reset = setTimeout(home, 560);
    }, 4200);
    return () => {
      clearInterval(id);
      clearTimeout(reset);
      if (iRef.current === n) home(); // paused on the looping copy: snap back to the real first
    };
  }, [paused, msgs.length]);

  const loop = [...msgs, msgs[0]];

  return (
    <div className="relative h-8 overflow-hidden bg-em9 text-iv">
      <div className="relative mx-auto flex h-full max-w-[1320px] items-center justify-center px-6">
        <div className="h-8 overflow-hidden text-center">
          <div
            style={{
              transform: `translateY(-${i * 32}px)`,
              transition: tr ? "transform 520ms cubic-bezier(.22,1,.36,1)" : "none",
            }}
          >
            {loop.map((m, k) => (
              <div
                key={k}
                aria-hidden={k !== i ? true : undefined}
                className="flex h-8 items-center justify-center gap-2.5 font-sans text-[12.5px] leading-none font-medium tracking-[.02em] whitespace-nowrap hi:tracking-normal"
              >
                <span className="block size-3 text-g3">
                  <Icon name="lotus" />
                </span>
                {m}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-0 right-6 hidden h-8 items-center gap-[18px] font-sans text-[12px] leading-none font-medium md:flex">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-[7px] text-iv no-underline"
          >
            <span className="block size-3.5 text-g3">
              <Icon name="whatsapp" />
            </span>
            {WHATSAPP_DISPLAY}
          </a>
          <span aria-hidden className="h-3 w-px bg-[rgba(217,185,106,.4)]" />
          <div role="group" aria-label={t("language")} className="flex gap-2.5">
            <button
              type="button"
              lang="en"
              onClick={() => setLocale("en")}
              aria-pressed={!hi}
              className={cn(
                "cursor-pointer border-0 bg-transparent px-0 py-1 font-sans text-[12px] leading-none font-semibold text-iv",
                !hi && "shadow-[inset_0_-1px_0_#D9B96A]",
              )}
            >
              EN
            </button>
            <button
              type="button"
              lang="hi"
              onClick={() => setLocale("hi")}
              aria-pressed={hi}
              className={cn(
                "cursor-pointer border-0 bg-transparent px-0 py-1 font-hi text-[13px] leading-none font-medium text-iv",
                hi && "shadow-[inset_0_-1px_0_#D9B96A]",
              )}
            >
              हिं
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
