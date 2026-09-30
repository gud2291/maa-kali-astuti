"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Dialog } from "radix-ui";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { InlineArt } from "@/components/ui/InlineArt";
import { secs } from "@/lib/core/format";
import { isReduced } from "@/lib/hooks/useReducedMotion";

/* Shorts story viewer (Home.dc.html 827–838, svOpen 1295–1298, svClose 1299; Videos page 209–212).
   Full-screen 9:16 card over a dark scrim. One progress segment per short: earlier ones full, the
   current one fills over the short's duration and then advances; after the last it closes.
   Tap zones (left / right 35%) step back / forward, ←/→ too; Esc or the button closes.
   Radix Dialog gives the focus trap, scroll lock and focus return; Close is focused on open.
   Reduced motion: the current segment shows full and nothing auto-advances. The fill pauses
   while the tab is hidden. Preview only: real Shorts play on YouTube (phase B ids). */

export type ShortItem = { id: string; en: string; dur: string };

export function ShortsViewer({
  shorts,
  thumbs,
  index,
  onIndex,
  uid,
}: {
  shorts: ShortItem[];
  /** Tall thumbnail markup per short id (trusted strings from src/lib/art/thumbs.ts). */
  thumbs: Record<string, string>;
  /** Open short, or −1 when closed. */
  index: number;
  /** Go to a short; any index outside the list closes the viewer. */
  onIndex: (i: number) => void;
  /** Id prefix for the thumbnail SVG defs. */
  uid: string;
}) {
  const t = useTranslations("shorts");
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Bumped on every step so going "back" from the first short restarts its segment (svOpen(0)).
  const [run, setRun] = useState(0);
  const go = (i: number) => {
    setRun((r) => r + 1);
    onIndex(i);
  };
  const cb = useRef(go);
  useEffect(() => {
    cb.current = go;
  });

  const n = shorts.length;
  const open = index >= 0 && index < n;
  const sh = open ? shorts[index] : null;

  // Segments for the current short; the fill advances to the next one when it finishes.
  useEffect(() => {
    if (!open) return;
    const segs = segRefs.current;
    segs.forEach((g, j) => {
      if (!g) return;
      g.getAnimations().forEach((a) => a.cancel());
      g.style.transform = j < index ? "scaleX(1)" : "scaleX(0)";
    });
    const g = segs[index];
    if (!g) return;
    if (isReduced()) {
      g.style.transform = "scaleX(1)";
      return;
    }
    const a = g.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: secs(shorts[index].dur) * 1000,
      fill: "forwards",
    });
    a.onfinish = () => cb.current(index + 1);
    const onVis = () => (document.hidden ? a.pause() : a.play());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      a.onfinish = null;
      a.cancel();
    };
  }, [open, index, shorts, run]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(Math.max(0, index - 1));
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onIndex(-1)}>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          onKeyDown={onKey}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            closeRef.current?.focus();
          }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(6,20,15,.94)] p-4 outline-none"
        >
          {sh && (
            <div className="relative aspect-[9/16] h-[min(86vh,720px)] max-w-full overflow-hidden rounded-[8px] bg-n9 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]">
              <span className="absolute inset-0 block">
                <InlineArt key={sh.id} svg={thumbs[sh.id] ?? ""} uid={`${uid}${sh.id}`} />
              </span>
              <div className="absolute top-2.5 right-2.5 left-2.5 flex gap-1">
                {shorts.map((x, j) => (
                  <span key={x.id} className="h-[3px] flex-1 overflow-hidden rounded-pill bg-[rgba(251,247,238,.3)]">
                    <span
                      ref={(el) => {
                        segRefs.current[j] = el;
                      }}
                      data-sg=""
                      className="block h-full origin-left bg-iv"
                      style={{ transform: j < index ? "scaleX(1)" : "scaleX(0)" }}
                    />
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(Math.max(0, index - 1))}
                aria-label={t("prev")}
                className="absolute top-0 bottom-0 left-0 w-[35%] cursor-pointer border-0 bg-transparent"
              />
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label={t("next")}
                className="absolute top-0 right-0 bottom-0 w-[35%] cursor-pointer border-0 bg-transparent"
              />
              <Dialog.Close
                ref={closeRef}
                aria-label={t("close")}
                className="absolute top-[22px] right-2.5 grid size-11 cursor-pointer place-items-center rounded-pill border-0 bg-[rgba(10,31,26,.6)] text-iv"
              >
                <Icon name="close" className="size-5" />
              </Dialog.Close>
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-[linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.7))] px-4 py-[18px]">
                <Dialog.Title className="m-0 font-sans text-[15px] leading-[1.35] font-semibold text-iv">
                  {sh.en}
                </Dialog.Title>
                <span className="font-sans text-[12px] leading-[1.3] font-medium text-sg3">
                  {t("meta", { dur: sh.dur })}
                </span>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
