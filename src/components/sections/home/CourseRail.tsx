"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { drawYantra, onView, prime } from "@/components/motion/draw";
import { isReduced } from "@/lib/hooks/useReducedMotion";

/* §10 course track behaviour (Home.dc.html 664–683, initTrack 1276–1282, vCourses 1305–1310).
   - Mouse drag scrolls the track: 5px threshold, snap off while dragging (cursor grabbing), snap
     back 60 ms after release; a drag never follows the card link. Touch/pen scroll natively.
   - Prev / next scroll by ±306 px (smooth unless reduced motion).
   - S11: every yantra ([data-yantra]) is primed, then draws over 1600 ms once 35% visible;
     hovering or focusing a card redraws it (at most every 1800 ms). Reduced motion: complete. */

const STEP = 306;

export function CourseRail({
  region,
  prev,
  next,
  children,
}: {
  region: string;
  prev: string;
  next: string;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Drag to scroll (mouse only).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let down = false;
    let moved = false;
    let x0 = 0;
    let s0 = 0;
    let snapT = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = false;
      x0 = e.clientX;
      s0 = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 5 && !moved) {
        moved = true;
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
      }
      if (moved) el.scrollLeft = s0 - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.cursor = "";
      if (moved) {
        clearTimeout(snapT);
        snapT = window.setTimeout(() => (el.style.scrollSnapType = ""), 60);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    };
    // Links are draggable={false}, but images inside could still start a native drag.
    const onDragStart = (e: DragEvent) => e.preventDefault();
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);
    return () => {
      clearTimeout(snapT);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  // S11: draw each yantra on view; redraw on hover / focus (1800 ms throttle per card).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ys = [...el.querySelectorAll<HTMLElement>("[data-yantra]")];
    ys.forEach((y) => prime(y));
    const offs = ys.map((y) => onView(y, () => drawYantra(y, 1600), 0.35));
    const until = new Map<string, number>();
    const redraw = (e: Event) => {
      const card = (e.target as Element | null)?.closest<HTMLElement>("[data-course]");
      if (!card || !el.contains(card) || isReduced()) return;
      // Ignore moves between elements inside the same card.
      const from = (e as MouseEvent).relatedTarget as Node | null;
      if (e.type === "mouseover" && from && card.contains(from)) return;
      const k = card.dataset.course!;
      const now = Date.now();
      if ((until.get(k) || 0) > now) return;
      until.set(k, now + 1800);
      drawYantra(card.querySelector("[data-yantra]"), 1600);
    };
    el.addEventListener("mouseover", redraw);
    el.addEventListener("focusin", redraw);
    return () => {
      offs.forEach((off) => off());
      el.removeEventListener("mouseover", redraw);
      el.removeEventListener("focusin", redraw);
    };
  }, []);

  const by = (dx: number) => trackRef.current?.scrollBy({ left: dx, behavior: isReduced() ? "auto" : "smooth" });

  const btn =
    "grid size-11 cursor-pointer place-items-center rounded-pill border-0 bg-transparent text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)] hover:bg-[rgba(217,185,106,.1)]";

  return (
    <div className="relative min-w-0">
      <div
        ref={trackRef}
        role="region"
        aria-label={region}
        className="-mr-4 no-scrollbar flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pt-1.5 pr-4 pb-2.5 pl-0.5 md:-mr-8 md:pr-8 lg:mr-[calc(-1*max(32px,(100vw-1320px)/2+32px))]"
      >
        {children}
      </div>
      <div className="mt-[18px] flex gap-2.5">
        <button type="button" onClick={() => by(-STEP)} aria-label={prev} className={btn}>
          <Icon name="chevL" className="size-[18px]" />
        </button>
        <button type="button" onClick={() => by(STEP)} aria-label={next} className={btn}>
          <Icon name="chevR" className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}
